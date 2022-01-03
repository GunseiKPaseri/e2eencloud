document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('signup').addEventListener('click', ()=>{
    const form = document.forms.signupform;
    const username = form.email.value;
    const password = form.password.value;
    const data = {username, password};
    fetch(`${location.href}api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      });
  });
});
