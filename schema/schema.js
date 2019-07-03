const graphql = require('graphql'); // Require graphQL
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql // destructure it for use in the file

const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: { 
            type: new GraphQLList(UserType),
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                .then(res => res.data)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: { 
            type: CompanyType,
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        },
    })
}) // pur user type defines the structure of the record that exists in our database

const RootQuery = new GraphQLObjectType({ // our rootQuery iis what points us to a very particular record in our graph
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: {id: {type: GraphQLString}}, // the root query expects to receive an id as an argument. That ID is a string
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(resp => resp.data)
            } // resolve is the function that actually returns the data. We don't really care about the 
            // parentValue, we normally just care about the args arguments.
        },
        company: {
            type: CompanyType,
            args: {id: {type: GraphQLString}},
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(resp => resp.data)
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString}
            },
            resolve: (parentValue, {firstName, age}) => {
                return axios.post('http://localhost:3000/users/', {
                    firstName,
                    age
                })
                .then(res => res.data)
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: (parentValue, {userId}) => {
                return axios.delete(`http://localhost:3000/users/${userId}`)
                    .then(res => res.data)
            }
        },
        editUser: {
            type: UserType,
            args: {
                userId: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString}
            },
            resolve: (parentValue, args) => {
                return axios.patch(`http://localhost:3000/users/${args.userId}`, args)
                    .then(res => res.data)
            }
        }
    }

})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})

// {
//     user(id: "23") {
//       id,
//       firstName,
//       age
//     }
//   } // here is an example query. We ask our query to look though our users and return the properties id, firstname and age from the record