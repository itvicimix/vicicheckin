"use client";

import { useState, useEffect } from "react";
import { getSuperAdminUsers, createSuperAdminUser, deleteSuperAdminUser } from "@/actions/superAdminUser";
import { Users, Plus, Trash2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await getSuperAdminUsers();
    if (res.success) {
      setUsers(res.data || []);
    } else {
      toast.error("Failed to load users");
    }
    setIsLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    const res = await createSuperAdminUser({ email, password, name });
    
    if (res.success) {
      toast.success("User created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setShowAddForm(false);
      fetchUsers();
    } else {
      toast.error(res.error || "Failed to create user");
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this admin user?")) {
      const res = await deleteSuperAdminUser(id);
      if (res.success) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="text-blue-500" />
            Admin Users Management
          </h1>
          <p className="text-gray-400">Manage sub-admin accounts that have access to this dashboard.</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          {showAddForm ? "Cancel" : "Add New User"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-white mb-4">Create New Admin User</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name / Identifier</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700 text-sm font-medium text-gray-400">
                <th className="p-4 py-3">Name</th>
                <th className="p-4 py-3">Email Address</th>
                <th className="p-4 py-3">Created At</th>
                <th className="p-4 py-3">Role</th>
                <th className="p-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 text-sm">
              <tr className="hover:bg-gray-750 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">
                      NB
                    </div>
                    <span className="font-medium text-white">IT Operations</span>
                  </div>
                </td>
                <td className="p-4 text-gray-300">it@nailbook247.com</td>
                <td className="p-4 text-gray-400">System Core</td>
                <td className="p-4">
                  <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                    Root Master
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-gray-600 text-xs flex items-center justify-end gap-1">
                    <ShieldAlert size={14} /> Immutable
                  </span>
                </td>
              </tr>
              
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No sub-admin users created yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center font-bold">
                          {user.name?.[0]?.toUpperCase() || "A"}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                        Sub Admin
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
