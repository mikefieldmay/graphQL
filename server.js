const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema')

const app = express();

app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
})) // graphiql is a ui that lets us view our schemas

app.listen(4000, () => {
    console.log("Listening on port 4000");
});
