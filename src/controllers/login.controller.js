import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js'
import { TOKEN_SECRET } from '../config.js';


export const loginUser = async (req, res, next) =>{
    try{
        const {username_user, pass_user} = req.params;
        if(!username_user || !pass_user){
            return res.status(400).json({message : 'Error, favor de proporcionar ambios campos'})
        }
        const result = await pool.query('SELECT * FROM user_credentials WHERE username_user = $1', [username_user]);
    }catch(error){
        next(error);
    }
}

export const registerUser = async (req, res, next) =>{
    const client = await pool.connect();
    try{
        const {street_user, num_street_user, num_inter_street_user, cp_user, city_user, country_user} = req.body;
        const {names_user, ap_pat_user, ap_mat_user, phone_number_user} =req.body;
        const {username_user, pass_user} = req.body;
    
        if(!street_user || ! num_street_user || !cp_user || ! city_user || !country_user || !names_user || !ap_pat_user || !ap_mat_user || !phone_number_user || !username_user || !pass_user){
        return res.status(422).json({message : 'Favor de llenar todos los campos'});
    }
        await client.query('BEGIN')
        const userAlredyExist = await client.query('SELECT * FROM user_credentials WHERE username_user = $1', [username_user]);
        if (userAlredyExist.rowCount > 0) {
            await client.query('ROLLBACK'); // Cancelamos todo si ya existe
            return res.status(409).json({ message: 'El nombre de usuario ya está en uso' });
        }
        
        //hasheo del password
        const passwordHash = await bcrypt.hash(pass_user, 10);

        //guardando los datos del domicilio
        const addressQuery = `INSERT INTO adress_users(street_user, num_street_user, num_inter_street_user, cp_user, city_user, country_user) VALUES($1, $2, $3, $4, $5, $6) RETURNING id_adress_users`;
        const addressValues = [street_user, num_street_user, num_inter_street_user || null, cp_user, city_user, country_user];

        const addressResult = await client.query(addressQuery, addressValues);
        const idAddressGenerado = addressResult.rows[0].id_adress_users;

        //guardado de los datos de usuario
        const dataQuery = `
            INSERT INTO data_users(names_user, ap_pat_user, ap_mat_user, phone_number_user, id_adress_users) 
            VALUES($1, $2, $3, $4, $5) 
            RETURNING id_data_user
        `;
        const dataValues = [names_user, ap_pat_user, ap_mat_user, phone_number_user, idAddressGenerado];
        const dataResult = await client.query(dataQuery, dataValues);
        const idDataUserGenerado = dataResult.rows[0].id_data_user;
        const credsQuery = `
            INSERT INTO user_credentials(username_user, pass_user, id_data_user) 
            VALUES($1, $2, $3)
            RETURNING id_credentials, username_user
        `;
        const credsValues = [username_user, passwordHash, idDataUserGenerado];
        const credsResult = await client.query(credsQuery, credsValues);
        const newUser = credsResult.rows[0];//guarda el user 
        await client.query('COMMIT'); // Guardamos todo permanentemente
        //generación de token
        const token = jwt.sign(
            {
                id: newUser.id_credentials,
                username: newUser.username_user
            },
            TOKEN_SECRET || 'clave_secreta_temporal',
            {
                expiresIn: '2d'//duración del token 2 días
            }
        );

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            token: token,
            user: {
                id: newUser.id_credentials,
                username: newUser.username_user
            }
        });
    }catch(error){
        await client.query('ROLLBACK');
        return next(error);
    }finally {
        // Liberamos el cliente de la base de datos
        client.release();
    }
}