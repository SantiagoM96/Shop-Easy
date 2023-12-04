const email_input = document.getElementById('email')
const password_input = document.getElementById('password')
const loginButton = document.getElementById('loginButton')

loginButton.addEventListener('click', async (e) => {
    e.preventDefault()
    const email = email_input.value
    const password = password_input.value

    const response = await fetch('/api/sessions/', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
            email, password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json()

    response.ok
        ? Swal.fire({
            title: 'Success',
            text: `Login successfull`,
            icon: 'success',
            willClose: () => {
                window.location.href = '/home';
            }
        })
        : Swal.fire({
            title: 'Error',
            text: `${data.error}!`,
            icon: 'error',
        });

})

