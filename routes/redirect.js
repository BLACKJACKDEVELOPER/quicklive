

module.exports = {
    async post(req,res) {
        return res.redirect('live?UUID='+req.body.UUID);
    }
}