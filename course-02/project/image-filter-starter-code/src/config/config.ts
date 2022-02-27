require("dotenv").config()


export const config = {
  "jwt": {
    "secret": process.env.JWT_SECRET
  }
}