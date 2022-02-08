const express = require('express');
const router = new express.Router();
const db = require('../db')

router.get('/', async (req, res, next) => {
    try {
        let result = await db.query(`SELECT code, name FROM companies`);
        return res.status(200).json({ companies: result.rows });
    } catch (error) {
        return next(error);
    }
});
router.get('/:code', async (req, res, next) => {
    try {
        let companyCode = req.params.code;
        let result = await db.query(`SELECT * FROM companies WHERE code=$1`, [companyCode]);
        if(result.rows.length === 0){
            let notFoundError = new Error(`There is no company with code '${companyCode}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ company: result.rows});
    } catch (error) {
        return next(error);

    }
});
router.post('/', async (req, res, next) => {
    try {
        let { code, name, description } = req.body
        let result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description `, [code, name, description]);
        return res.status(201).json({ company: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});
router.put('/:code', async (req, res, next) => {
    try {
        let companyCode = req.params.code;
        let {code, name, description} = req.body;
        let result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description `, [name, description, companyCode]);
        if (result.rows.length === 0) {
            let notFoundError = new Error(`There is no company with code '${companyCode}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ company: result.rows[0] });
    } catch (error) {
        return next(error);

    }
});
router.delete('/:code', async (req, res, next) => {
    try {
        let companyCode = req.params.code;
        let result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [companyCode]);
        if (result.rows.length === 0) {
            let notFoundError = new Error(`There is no company with code '${companyCode}'`);
            notFoundError.status = 404;
            throw notFoundError;
        }
        return res.status(200).json({ status: "deleted" });
    } catch (error) {
        return next(error);

    }
});

module.exports = router;