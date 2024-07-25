import dotenv from 'dotenv'

dotenv.config();

const env =  function(){
    const env = {
        SERVER_PORT : process.env.SERVER_PORT
    }
    return env
}

export default env
