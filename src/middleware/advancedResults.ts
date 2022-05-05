import { NextFunction, Request, Response } from "express";

export const advancedResults = (model:any,populate: any)=> async(req:Request,res:Response,next:NextFunction)=>{
// we initially set the query

let query:any

// make a copy of req.query

const reqQuery = {...req.query}

// Fields to exclude

const removeFields = ["select","sort","page","limit"]

// loop over the removeFields array and remove them from the query we want to make

removeFields.forEach((param)=>delete reqQuery[param])

// we then convert the query object from the request from json to string to concatenate it to a string

let queryStr = JSON.stringify(reqQuery)

 // Create  mongoose operators for filtering ($gt, $gte, etc) from the query string
queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );



  // Finding resource
  query = model.find(JSON.parse(queryStr));



  // Select Fields
  if (req.query.select) {

    let data = req.query
    const fields = (data.select as string).split(",").join(" ");
    

    query = query.select(fields)
  }

  // Sort

  if (req.query.sort) {
    const sortBy = (req.query.sort as string).split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }


//   



// Pagination

const page = parseInt((req.query.page as string), 10) || 1;
const limit = parseInt((req.query.limit as string), 10) || 25;
const startIndex = (page - 1) * limit;
const endIndex = page * limit;
const total = await model.countDocuments();

query = query.skip(startIndex).limit(limit);

//   populate query
if (populate) {
  query = query.populate(populate);
}

// we then find using this query
const results = await query;

// pagination result

const pagination:any = {};

if (endIndex < total) {
  pagination.next = {
    page: page + 1,
    limit,
  };
}

if (startIndex > 0) {
  pagination.prev = {
    page: page - 1,
    limit,
  };
}

res.advancedResults = {
  success: true,
  count: results.length,
  pagination,
  data: results,
};

next();
}

