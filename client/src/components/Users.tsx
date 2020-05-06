import React, { useState, useEffect } from 'react';
import { useGetUsersQuery, User } from '../generated/graphql';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { data, error, loading } = useGetUsersQuery();

  useEffect(() => {
    if (data) {
      if (data && data.allUsers && data.allUsers.nodes) {
        setUsers(data.allUsers.nodes as User[])
      }
    }
    if (error) {
      console.log(error);
    }
    if (loading) {
      console.log(loading);
    }
  }, [data, error, loading]);

  return (
    <div>
      <h2>Hello users,</h2>
      {users &&
        users.length > 0 &&
        users.map((user: User, index: number) => (
          <p key={`user_${index}`}>{user.name}</p>
        ))}
    </div>
  );
};

export default Users;
