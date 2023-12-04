const updateUserRole = async (uid) => {
    const row = document.getElementById(uid);
    const newRole = row.cells[2].querySelector("input").value;
    const response = await fetch(`/api/users/premium/${uid}`, {
        method: 'PUT',
        body: JSON.stringify({
            newRole
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (response.ok) {
        Swal.fire({
            title: 'Success',
            text: 'User role update successfully',
            icon: 'success',
            timer: 3000,
        });
    } else {
        if (data.error.includes('You are missing the following documents')) {
            const documentsError = data.error.replace('You are missing the following documents: ', '');
            Swal.fire({
                title: 'Error',
                html: `You are missing the following documents: <strong>${documentsError}</strong>`,
                icon: 'error',
                timer: 3000,
            });
        } else {
            Swal.fire({
                title: 'Error',
                html: `${data.error}`,
                icon: 'error',
                timer: 3000,
            });
        }
    }
};

const deleteUser = async (userId) => {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const data = await response.json()
    console.log(response.ok)
    if (response.ok) {
        Swal.fire({
            icon: 'success',
            text: 'User deleted successfully',
            timer: 3000,
        });
    } else {
        Swal.fire({
            text: 'An error occurred while deleting the user' || data.error,
            icon: 'error',
            timer: 3000,
        });
    }
}

const deleteInactiveUsers = async () => {
    const response = await fetch('/api/users/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json()

    if (response.ok) {
        Swal.fire({
            icon: 'success',
            text: 'Users deleted successfully',
            timer: 3000,
        });
    }

    Swal.fire({
        text: data.error || 'An error occurred while deleting the users',
        icon: 'error',
        timer: 3000,
    });
}

const uploadDocuments = async (uid) => {
    const fileInput = document.getElementById(`documents-${uid}`);
    const files = fileInput.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
    }

    try {
        const response = await fetch(`api/users/${uid}/documents`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                text: 'Document uploaded successfully',
                timer: 3000,
            });
        } else {
            Swal.fire({
                text: data.error || 'An error occurred while uploading documents',
                icon: 'error',
                timer: 3000,
            });
        }
    } catch (error) {
        Swal.fire({
            text: 'An unexpected error occurred',
            icon: 'error',
            timer: 3000,
        });
    }
};