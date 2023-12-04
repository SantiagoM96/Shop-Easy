const deleteButton = document.querySelector('.deleteButton');

deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const userId = e.target.getAttribute('data-userid');
    try {

        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            Swal.fire({
                text: 'Account deleted successfully',
                icon: 'success',
                timer: 3000,
                willClose: () => {
                    window.location.href = '/';
                }
            });
        }

    } catch (error) {
        Swal.fire({
            text: 'An error occurred while deleting the account',
            icon: 'error',
            timer: 3000,
        });
    }
});