import React, { useState } from 'react';
import { Search, X, Trash2 } from 'lucide-react';

const PeoplePage = () => {
    const initialTeamMembers = [
        {
            id: 1,
            name: 'Shubham',
            email: 'shubham@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 2,
            name: 'Shaurya',
            email: 'shaurya@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 3,
            name: 'Soham',
            email: 'soham@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 4,
            name: 'Divy',
            email: 'divy@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'D',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 5,
            name: 'Sayan',
            email: 'sayan@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 6,
            name: 'Vignesh',
            email: 'vignesh@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'V',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 7,
            name: 'Prashant',
            email: 'admin@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            isYou: true,
            avatar: 'P',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 8,
            name: 'Sujal',
            email: 'sujal@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 9,
            name: 'Mehul',
            email: 'mehul@zamp.ai',
            role: 'System Admin',
            team: 'Add Team',
            avatar: 'M',
            avatarColor: 'bg-gray-800'
        }
    ];

    const invitedMembers = [
        {
            id: 10,
            name: 'Sujal',
            email: 'sujal@zamp.ai',
            role: 'System Admin',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 11,
            name: 'Raghav',
            email: 'raghav@zamp.ai',
            role: 'System Admin',
            avatar: 'R',
            avatarColor: 'bg-gray-800'
        },
        {
            id: 12,
            name: 'Swati',
            email: 'swati@zamp.ai',
            role: 'System Admin',
            avatar: 'S',
            avatarColor: 'bg-gray-800'
        }
    ];

    const [activeTab, setActiveTab] = useState('team');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [members, setMembers] = useState(initialTeamMembers);
    const [invited, setInvited] = useState(invitedMembers);
    const [selectedRole, setSelectedRole] = useState('System Admin');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const handleDeleteMember = (id) => {
        setMembers(members.filter(member => member.id !== id));
    };

    const handleDeleteInvited = (id) => {
        setInvited(invited.filter(member => member.id !== id));
    };

    return (
        <div className="flex-1 bg-white min-h-screen">
            {/* Page Header */}
            <div className="px-6 py-6">
                <h1 className="text-xl font-semibold text-gray-900">People</h1>
            </div>

            {/* Search and Invite Section */}
            <div className="px-6 pb-4 flex items-center justify-between">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search team members"
                        className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800"
                >
                    Invite members
                </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`pb-2 text-xs font-medium ${activeTab === 'team' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Team members
                    </button>
                    <button
                        onClick={() => setActiveTab('invited')}
                        className={`pb-2 text-xs font-medium ${activeTab === 'invited' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Invited
                    </button>
                </div>
            </div>

            {/* Table - Team Members */}
            {activeTab === 'team' && (
                <div className="px-6 py-3">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                <th className="text-right py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                                    <td className="py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 rounded-full ${member.avatarColor} flex items-center justify-center text-[10px] font-medium text-white`}>
                                                {member.avatar}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-900">{member.name}</span>
                                                {member.isYou && (
                                                    <span className="text-[10px] text-gray-500">(You)</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2.5">
                                        <span className="text-xs text-gray-900">{member.email}</span>
                                    </td>
                                    <td className="py-2.5">
                                        <span className="text-xs text-gray-900">{member.role}</span>
                                    </td>
                                    <td className="py-2.5">
                                        <span className="text-xs text-gray-400">{member.team}</span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table - Invited */}
            {activeTab === 'invited' && (
                <div className="px-6 py-3">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Invited as</th>
                                <th className="text-right py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invited.map((member) => (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                                    <td className="py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-5 h-5 rounded-full ${member.avatarColor} flex items-center justify-center text-[10px] font-medium text-white`}>
                                                {member.avatar}
                                            </div>
                                            <span className="text-xs text-gray-900">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5">
                                        <span className="text-xs text-gray-900">{member.email}</span>
                                    </td>
                                    <td className="py-2.5">
                                        <span className="text-xs text-gray-900">{member.role}</span>
                                    </td>
                                    <td className="py-2.5 text-right">
                                        <button
                                            onClick={() => handleDeleteInvited(member.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Invite Members</h3>
                                <p className="text-xs text-gray-500 mt-1">Type or paste mail addresses, separated by spaces or commas</p>
                            </div>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Share with people and teams"
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50"
                                >
                                    <span className="text-gray-700">{selectedRole}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showRoleDropdown && (
                                    <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                                        <button
                                            onClick={() => {
                                                setSelectedRole('System Admin');
                                                setShowRoleDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            System Admin
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedRole('Member');
                                                setShowRoleDropdown(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            Member
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 rounded"
                            >
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeoplePage;