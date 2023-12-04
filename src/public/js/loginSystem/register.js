const first_name_input = document.getElementById('first_name')
const last_name_input = document.getElementById('last_name')
const email_input = document.getElementById('email')
const age_input = document.getElementById('age')
const password_input = document.getElementById('password')
const registerButton = document.getElementById('registerButton')

registerButton.addEventListener('click', async (e) => {
    e.preventDefault()
    const first_name = first_name_input.value
    const last_name = last_name_input.value
    const email = email_input.value
    const age = age_input.value
    const password = password_input.value

    const response = await fetch('/api/sessions/register', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({
            first_name, last_name, email, age, password
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (response.ok) {
        Swal.fire({
            title: 'Success',
            text: 'The user registered successfully!',
            icon: 'success',
            didClose: () => {
                window.location.href = '/';
            }
        })
    } else {
        Swal.fire({
            title: 'Error',
            text: `${data.error}`,
            icon: 'error',
        });
    }
})