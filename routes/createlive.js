

module.exports = {
    async get (req,res) {
        const UUID = Math.floor(Math.random() * 1000000);
        return res.render('createlive.ejs',{UUID});
    }
}