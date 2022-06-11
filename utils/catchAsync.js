// ORIGINAL SYNTAX

// module.exports = function wrapAsync(fn){
// 	return function(req,res,next){
// 		fn(req,res,next).catch(er => next(er));
// 	}
// }

// NEW SYNTAX 

module.exports = func => {
	return (req,res,next) => {
		func(req,res,next).catch(next)
	}
}