import React, { useState, useEffect } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { usePreloadedQuery } from 'react-relay/hooks';
import { UsersQuery } from './__generated__/UsersQuery.graphql';
import { PreloadedQuery } from 'react-relay/lib/relay-experimental/EntryPointTypes';

export const RepositoryNameQuery = graphql`
  query UsersQuery {
    users(first: 10) {
      nodes {
        id
        name
        email
      }
    }
  }
`;

interface UsersProps {
  users: PreloadedQuery<UsersQuery, any>;
}

const Users: React.FC<UsersProps> = (props) => {
  const data = usePreloadedQuery(RepositoryNameQuery, props.users);

  return (
    <div>
      <h2>Hello users,</h2>
      {data.users?.nodes.map((user) => (
        <p>{user.name}</p>
      ))}
    </div>
  );
};

export default Users;
