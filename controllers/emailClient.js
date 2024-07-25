import emailer from 'nodemailer';

async function Send_email(msg="",asunto="",let_mail=""){
    const email_data ={
        host: 'smtp-mail.outlook.com',
        user: 'mateo.vasquez1723@outlook.com',
        password: 'MMatobaz>=0x7CBhot',
        dest: 'mateo.vasquez@epn.edu.ec;mteov05@gmail.com;'+let_mail,
    }
    
    
    let transporter = emailer.createTransport({
        host: email_data.host,
        secure: false,
        port:'587',
        tls:{
            ciphers: "SSLv3",
            rejectUnauthorized: false,
        },
        auth:{
            user: email_data.user,
            pass:email_data.password,
        },
        debug:true,
        logger:true,
    });
    
    let mailoptions ={
        from: email_data.user,
        to: email_data.dest,
        subject: asunto,
        text: msg
    };
    transporter.sendMail(mailoptions,(err,info)=>{
        if (err){
            console.log('Error: '+error)
            return 'Error'
        }else{
            console.log(info.response)
            return 'Enviado'
        }
    })
    
}

export {Send_email}