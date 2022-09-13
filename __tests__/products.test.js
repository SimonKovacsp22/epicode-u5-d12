// By default jest doesn't work with the new import syntax
// We should add NODE_OPTIONS=--experimental-vm-modules to the test script to fix that
import supertest from "supertest"
import dotenv from "dotenv"
import mongoose from "mongoose"
import server from "../src/server.js"
import ProductsModel from "../src/api/products/model.js"
import { text } from "express"

dotenv.config() // This command forces .env variables to be loaded into process.env. This is the way to go when you can't use -r dotenv/config

const client = supertest(server) // Supertest is capable of running server.listen and it gives us back a client to be used to run http req against that server

const validProduct = {
  name: "test",
  description: "bla bla bla",
  price: 20,
}

const notValidProduct = {
  name: "test",
  description: "bla bla bla",
}
const updateForProduct = {
  name:"changed to Mest"
}


beforeAll(async () => {
  // beforeAll hook could be used to connect to Mongo and also to do some initial setup (like inserting mock data into the db)
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
  const newProduct = new ProductsModel(validProduct)
  await newProduct.save()
})

afterAll(async () => {
  // afterAll hook could be used to close the connection with Mongo properly and to clean up db/collections
  await ProductsModel.deleteMany()
  await mongoose.connection.close()
})

describe("test api", () => {
  test("should check that mongo env var is set correctly", () => {
    expect(process.env.MONGO_CONNECTION_STRING).toBeDefined()
  })

  test("Should test that GET /products returns a success status code and a body", async () => {
    const response = await client.get("/products").expect(200)
    
  })

  test("Should test that POST /products returns a valid _id and 201", async () => {
    const response = await client
      .post("/products")
      .send(validProduct)
      .expect(201)
    expect(response.body._id).toBeDefined()
    
  })

  test("Should test that POST /products returns 400 in case of not valid product", async () => {
    await client.post("/products").send(notValidProduct).expect(400)
  })

  test("should test that GET /products/test endpoint returns a success status code", async () => {
    const response = await client.get("/products/test").expect(200)
    expect(response.body.message).toEqual("test")
  })
})

describe("test products endpoints", ()=> {
  test("should test /products/:id endpoint and response when valid id is sent", async ()=> {
    const response = await client.get("/products/123456123456123456123456").expect(404)
    console.log(response.body.success)
  })

  test("should test /products/:id endpoint and response when invalid id is requested", async ()=> {
    const products = await ProductsModel.find()
    const {_id} = products[0]
    const response = await client.get(`/products/${_id}`).expect(200)
    expect(response.body.name).toEqual("test")
  })

  test("should test update endpoint and response when valid id is sent", async ()=> {
    const products = await ProductsModel.find()
    const {_id} = products[0]
    const response = await client.put(`/products/${_id}`).send(updateForProduct).expect(200)
    expect(response.body.name).toEqual("changed to Mest")
  })

  test("should test update endpoint when invalid id is requested", async ()=> {
    const response = await client.put("/products/123456123456123456123456").expect(404)
    console.log(response.body.message)
  })
  test("should test delete endpoint and response when valid id is sent", async ()=> {
    const products = await ProductsModel.find()
    const {_id} = products[0]
    const response = await client.delete(`/products/${_id}`).expect(204)
  })

  test("should test delete endpoint when invalid id is requested", async ()=> {
    const response = await client.delete("/products/123456123456123456123456").expect(404)
  })

})
