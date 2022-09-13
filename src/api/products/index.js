import express from "express"
import createError from "http-errors"
import ProductsModel from "./model.js"

const productsRouter = express.Router()

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsModel(req.body) // here mongoose validation happens
    const { _id } = await newProduct.save() // here the validated record is saved
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/test", async (req, res, next) => {
  res.send({ message: "test" })
})

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductsModel.find()
    res.send(products)
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const prod = await ProductsModel.findById(req.params.id)
    if (prod) {
      res.send(prod)
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (updatedProduct) {
      res.send(updatedProduct)
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.id)
    if (deletedProduct) {
      res.status(204).send()
    } else {
      next(createError(404, `User with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default productsRouter
