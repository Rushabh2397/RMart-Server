


module.exports = {

    convertRomanToInteger : async (req, res) => {
        try {
             console.log("req.body",req.body)
            if(!req.body.romanNumber){
                console.log("inside ")
                throw new Error ('Roman number is required.')
            }

            let romanObject = {
                i: 1,
                v: 5,
                x: 10
            }
            let sum = 0;
            for (let i = 0; i < req.body.romanNumber.length; i++) {
                let charValue = romanObject[req.body.romanNumber[i]]
                let nextValue = i + 1 < req.body.romanNumber.length ? romanObject[req.body.romanNumber[i+1]] : 0;

                sum = sum + (charValue < nextValue ? (-charValue) : charValue)
            }

            return res.json({
                status: 'success',
                message: 'Converted roman number.',
                data: sum
            })
        } catch (error) {
            console.log("error",error)
            return res.json({
                status: 'Failed',
                message: 'Failed to convert roman number.',
            })
        }
    }
}