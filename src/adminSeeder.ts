import User from './database/models/User'
import bcrypt from 'bcryptjs'

const adminSeeder = async():Promise<void>=>{
    //check if admin is already registered or not
    const [data] = await User.findAll({
        where : {
            email : "admin@gmail.com"
        }
    })
    //create a admin
    if(!data){
        await User.create({
            username : "admin",
            email : "admin@gmail.com",
            password : bcrypt.hashSync("admin",10),
            role : "admin"
        })
        console.log("admin seeded successfully")
    }else{
        console.log("admin already seeded")
    }
}

export default adminSeeder
