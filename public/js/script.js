//regex for registration
const emailExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameExp = /^[a-zA-Z0-9]{3,}$/;

const email = document.getElementsByName('email')[0];
const password = document.getElementsByName('password')[0];
const username = document.getElementsByName('username')[0];
const submit = document.getElementsByName('regi')[0];

//while typing email chack if the email is valid or not. if valid add green tick nexto to email field else red cross
email.onkeyup = () => {
    if (emailExp.test(email.value)) {
        email.style.color = 'green';
        
    } else {
        email.style.color = 'red';
        
    }
}
password.onkeyup = () => {
    if (passwordExp.test(password.value)) {
        password.style.color = 'green';
       
    } else {
        password.style.color = 'red';
       
    }
}
username.onkeyup = () => {
    if (usernameExp.test(username.value)) {
        username.style.color = 'green';
     
    } else {
        username.style.color = 'red';
      
    }
}