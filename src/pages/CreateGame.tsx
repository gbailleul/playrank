import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateGameDto } from '../types';

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameType: 'DARTS',
    maxScore: 501,
    minPlayers: 2,
    maxPlayers: 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxScore' || name === 'minPlayers' || name === 'maxPlayers' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const game = await response.json();
        navigate(`/games/${game.id}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Create New Darts Game</h1>
        <p className="text-gray-600 mb-6">Set up a new game of 301 or 501 darts</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Game Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Friday Night Darts"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description (Optional)
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Weekly darts tournament"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Game Variant</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="maxScore"
                  value="301"
                  checked={formData.maxScore === 301}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span>301</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="maxScore"
                  value="501"
                  checked={formData.maxScore === 501}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span>501</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="minPlayers" className="block text-sm font-medium">
                Minimum Players
              </label>
              <input
                id="minPlayers"
                name="minPlayers"
                type="number"
                min="2"
                max="8"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.minPlayers}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="maxPlayers" className="block text-sm font-medium">
                Maximum Players
              </label>
              <input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                min="2"
                max="8"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.maxPlayers}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGame; 