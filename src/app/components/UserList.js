"use client";

const UserList = ({ users, currentUserId }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Participants ({users.length})</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div 
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.id === currentUserId ? 'bg-blue-50 border-blue-200 border' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${user.hasVoted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="font-medium">
                {user.name} {user.id === currentUserId && '(You)'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {user.hasVoted && (
                <span className="text-sm text-green-600 font-medium">✓ Voted</span>
              )}
              {user.isObserver && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Observer</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;