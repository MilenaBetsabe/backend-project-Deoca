const socket = io();

document.getElementById('createProductBtn').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const code = document.getElementById('code').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const category = document.getElementById('category').value;
    const thumbnails = document.getElementById('thumbnails').value;

    const newProduct = {
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails: thumbnails ? [thumbnails] : []
    };

    try {
        const response = await fetch('/api/products/new_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            console.log("Producto creado correctamente");

            // Limpiar los campos de entrada
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            document.getElementById('code').value = '';
            document.getElementById('price').value = '';
            document.getElementById('stock').value = '';
            document.getElementById('category').value = '';
            document.getElementById('thumbnails').value = '';
        } else {
            console.error("Error al crear el producto");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

socket.on('productAdded', (product) => {
    const container = document.querySelector('.container');
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
        <p>ID: ${product.id}</p>
        <p>Título: ${product.title}</p>
        <p>Descripción: ${product.description}</p>
        <p>Código: ${product.code}</p>
        <p>Precio: ${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <p>Categoría: ${product.category}</p>
        ${product.thumbnails.map(url => `<img src="${url}" alt="Imagen del producto">`).join('')}
        <button class="button2" data-id="${product.id}">Eliminar</button>
    `;

    container.appendChild(card);
});

document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('button2')) {
        const productId = event.target.getAttribute('data-id');

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log("Producto eliminado correctamente");
            } else {
                console.error("Error al eliminar el producto");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
});

socket.on('productDeleted', (id) => {
    const buttonToRemove = document.querySelector(`.card button[data-id='${id}']`);
    if (buttonToRemove) {
        const cardToRemove = buttonToRemove.closest('.card');
        cardToRemove.remove();
    } else {
        console.error(`No se encontró el botón con data-id='${id}'`);
    }
});
