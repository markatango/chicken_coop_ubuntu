import { formatDate } from '../utils/utilityfunctions';
import { User, Trash2 } from 'lucide-react';
import { USER_ROLES } from '../config/userroles';

const UserTable = ({ users, currentUserId, onRoleChange, onDeleteUser }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Login
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((userData) => (
          <tr key={userData.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {userData.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {userData.email}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={userData.role}
                onChange={(e) => onRoleChange(userData.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={userData.id === currentUserId}
              >
                <option value={USER_ROLES.USER}>User</option>
                <option value={USER_ROLES.ADMINISTRATOR}>Administrator</option>
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {userData.id !== currentUserId && (
                <button
                  onClick={() => onDeleteUser(userData.id)}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default UserTable;