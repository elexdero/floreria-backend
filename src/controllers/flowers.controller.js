import { pool } from '../db.js'

export const getFlowers = async (req, res, next) =>{
    try{
        const {rows} = await pool.query('SELECT * FROM flowers');
        if(rows.length === 0){
            return res.status(204).json({message : "No hay flores que mostrar"});
        }
        console.log("conexión con db exitosa")
        return res.json(rows)
        
    }catch(error){
        next(error);
    }
}