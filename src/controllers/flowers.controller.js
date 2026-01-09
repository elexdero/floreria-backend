import { pool } from '../db.js'

export const getFlowers = async ( req, res, next) =>{
    try{
        const {rows} = await pool.query('SELECT * FROM flowers');
        if(rows.length === 0){
            return res.json({message : "No hay flores que mostrar"});
        }
        return res.json(rows)
        
    }catch(error){
        next(error);
    }
}

export const getFlowerById = async (req, res, next) =>{
    try{
        const {id} = req.params;
        const {rows} = await pool.query(`SELECT * FROM flowers WHERE id_flower = $1`,[id]);
        if(rows.length === 0){
            return res.status(204).json({message : 'Error, no hay plantas que mostrar'})
        }
        return res.json(rows[0]);//rows[0] porque es un array que contiene las flores, solo nos interesa el primero
    }catch(error){
        return next(error);
    }
}

export const postFlower = async ( req, res, next) =>{
    try{
        const {name_flower, image_flower, price_flower, stock_flower} = req.body;
        if(!name_flower || !price_flower  || !stock_flower){
            return res.status(422).json({message : 'Favor de llenar los campos'})
        }
        //validar previamente si ya existe antes de guardar
        const validateExistant = await pool.query('SELECT * FROM flowers WHERE name_flower = $1', [name_flower]);
        if(validateExistant === 0){
            const {rows} = await pool.query('INSERT INTO flowers (name_flower, image_flower, price_flower, stock_flower) VALUES($1, $2, $3, $4) RETURNING *', [name_flower, image_flower || null, price_flower, stock_flower]);
            res.json(rows[0]);
        }
        res.status(409).json({message : 'La flor ya existe'}); 
    }catch(error){
        next(error);
    }
}




