import jwt from "jsonwebtoken";

export const getDataFromToken = (request) => {
  try {
    const authorizationHeader = request.headers.get("authorization");

    if (!authorizationHeader) {
      throw new Error("Token not found");
    }

    const token = authorizationHeader.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    return decodedToken.id;
  } catch (error) {
    throw new Error(error.message);
  }
};