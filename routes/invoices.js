const express = require("express");
const router = new express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        let result = await db.query(`SELECT * FROM invoices`);
        return res.status(200).json({ invoices: result.rows });
    } catch (error) {
        return next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        let id = req.params.id
        let invoiceResult = await db.query(`SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code=c.code) WHERE id=$1 `, [id]);
        if (invoiceResult.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with id '${id}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        const invoice = {
            id: invoiceResult.rows[0].id,
            amt: invoiceResult.rows[0].amt,
            paid: invoiceResult.rows[0].paid,
            add_date: invoiceResult.rows[0].add_date,
            paid_date: invoiceResult.rows[0].paid_date,
            company: {
                code: invoiceResult.rows[0].comp_code,
                name: invoiceResult.rows[0].name,
                description: invoiceResult.rows[0].description
            }
        };

        return res.status(200).json({ invoices: invoice });
    } catch (error) {
        return next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        let { comp_code, amt } = req.body
        let result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date `, [comp_code, amt]);
        return res.status(201).json({ invoice: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING * `, [req.body.amt, id]);
        if (result.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with id '${id}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ company: result.rows[0] });
    } catch (error) {
        return next(error);

    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        let id = req.params.id
        let invoiceResult = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id]);
        if (invoiceResult.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with id '${id}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});
router.get('/companies/:comp_code', async (req, res, next) => {
    try {
        let compCode = req.params.comp_code
        let invoiceResult = await db.query(`SELECT c.code, c.name, c.description, i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date FROM companies AS c INNER JOIN invoices AS i ON (c.code = i.comp_code) WHERE i.comp_code=$1 `, [compCode]);

        if (invoiceResult.rows.length === 0) {
            let notFoundError = new Error(`There is no invoice with comp_code '${compCode}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        let data = invoiceResult.rows[0];
        let company = {
            code: data.code,
            name: data.name,
            description: data.description,
            invoices: [data.id, data.comp_code, data.amt, data.paid, data.add_date, data.paid_date]
        };
        return res.status(200).json({ company: company });
    } catch (error) {
        return next(error);
    }
});
module.exports = router;