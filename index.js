import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: "123456",
    port: 5432
});
db.connect();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

async function getBookCover(title) {
    try {
        const response = await axios.get(`https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-L.jpg?default=false`);
        return response.status === 200 ? response.config.url : '/img/default-cover.jpg';
    } catch (error) {
        console.error('Error fetching book cover:', error);
        return '/img/default-cover.jpg';
    }
}

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY read_date ASC");
        const books = result.rows;
        res.render("index.ejs", { books: books });
    } catch (err) {
        console.log(err);
    }
});

app.post('/add', async (req, res) => {
    const { title, author, notes, rating, read_date } = req.body;
    const cover_url = await getBookCover(title);
    try {
        await db.query(
            "INSERT INTO books (text, author, notes, rating, read_date, cover_url) VALUES ($1, $2, $3, $4, $5, $6)",
            [title, author, notes, rating, read_date, cover_url]
        );
        res.redirect('/');
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, notes, rating, read_date } = req.body;
    const cover_url = await getBookCover(title);
    try {
        await db.query(
            "UPDATE books SET text = $1, author = $2, notes = $3, rating = $4, read_date = $5, cover_url = $6 WHERE id = $7",
            [title, author, notes, rating, read_date, cover_url, id]
        );
        res.redirect("/");
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/delete/:id', async (req, res) => {
    const {id} = req.params;
    try{
        await db.query("DELETE FROM books WHERE id = $1", [id]);
        res.redirect("/")
    } catch(err){
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
