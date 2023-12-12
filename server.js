const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');

const init = async () => {
    const server = Hapi.server({
        port: 9000,
        host: 'localhost'
    });

    let books = []; // Store books data in memory

    // Fungsi utilitas untuk mengembalikan versi yang disederhanakan dari buku
    const simplifyBook = (book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
    });

    server.route({
        method: 'POST',
        path: '/books',
        handler: (request, h) => {
            const {
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading
            } = request.payload;

            if (!name) {
                return h.response({ status: 'fail', message: 'Gagal menambahkan buku. Mohon isi nama buku' }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({ status: 'fail', message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
            }

            const id = nanoid(10);
            const insertedAt = new Date().toISOString();
            const updatedAt = insertedAt;
            const finished = pageCount === readPage;

            const newBook = {
                id,
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                finished,
                reading,
                insertedAt,
                updatedAt
            };

            books.push(newBook);
            return h.response({ status: 'success', message: 'Buku berhasil ditambahkan', data: { bookId: id } }).code(201);
        }
    });

    server.route({
        method: 'GET',
        path: '/books',
        handler: (request, h) => {
            const simplifiedBooks = books.map(simplifyBook);
            return h.response({ status: 'success', data: { books: simplifiedBooks } });
        }
    });
    
    server.route({
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
            const book = books.find(book => book.id === bookId);

            if (!book) {
                return h.response({ status: 'fail', message: 'Buku tidak ditemukan' }).code(404);
            }

            return h.response({ status: 'success', data: { book } });
        }
    });


    server.route({
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
            const {
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading
            } = request.payload;
    
            if (!name) {
                return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Mohon isi nama buku' }).code(400);
            }
    
            const index = books.findIndex(book => book.id === bookId);
            if (index === -1) {
                return h.response({ status: 'fail', message: 'Gagal memperbarui buku. Id tidak ditemukan' }).code(404);
            }
    
            // Validasi payload
            if (readPage > pageCount) {
                return h.response({ status: 'fail', message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount' }).code(400);
            }
    
            // Update book details
            books[index] = {
                ...books[index],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                updatedAt: new Date().toISOString()
            };
    
            return h.response({ status: 'success', message: 'Buku berhasil diperbarui' });
        }
    });
    
    

    server.route({
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const bookId = request.params.bookId;
    
            const index = books.findIndex(book => book.id === bookId);
            if (index === -1) {
                return h.response({ status: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan' }).code(404);
            }
    
            books.splice(index, 1);
    
            return h.response({ status: 'success', message: 'Buku berhasil dihapus' });
        }
    });
    
    

    await server.start();
    console.log(`Server is running on ${server.info.uri}`);
};

init();
