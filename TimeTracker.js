import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import _ from 'lodash';
import { Calendar, BarChart, List } from 'lucide-react';

const TimeTracker = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    category: '',
    description: '',
    hasPhone: false,
    hasTvOn: false
  });

  const calculateDuration = (start, end) => {
    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);
    const diffMs = endDate - startDate;
    const minutes = Math.floor(diffMs / 60000);
    return { hours: Math.floor(minutes / 60), minutes: minutes % 60, totalMinutes: minutes };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = calculateDuration(formData.startTime, formData.endTime);
    setEntries([...entries, { 
      ...formData, 
      duration: `${duration.hours}h ${duration.minutes}m`,
      durationMinutes: duration.totalMinutes 
    }]);
    setFormData({
      ...formData,
      startTime: '',
      endTime: '',
      category: '',
      description: '',
      hasPhone: false,
      hasTvOn: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const analyzeTime = () => {
    const categoryTotals = _.groupBy(entries, 'category');
    const analysis = [];
    
    // Calculate total minutes per category
    Object.entries(categoryTotals).forEach(([category, activities]) => {
      const totalMinutes = _.sumBy(activities, 'durationMinutes');
      analysis.push({
        category,
        totalMinutes,
        percentageOfDay: ((totalMinutes / 1440) * 100).toFixed(1)
      });
    });

    // Generate insights
    const insights = [];
    analysis.forEach(({category, totalMinutes}) => {
      if (category.toLowerCase().includes('work') && totalMinutes > 600) {
        insights.push(`Consider reducing work time (${Math.floor(totalMinutes/60)}h) for better work-life balance`);
      }
      if (category.toLowerCase().includes('family') && totalMinutes < 120) {
        insights.push('Try to increase family time to at least 2 hours per day');
      }
      if ((category.toLowerCase().includes('chores') || category.toLowerCase().includes('hygiene')) 
          && totalMinutes > 180) {
        insights.push(`Look for ways to optimize ${category.toLowerCase()} routine`);
      }
    });

    return { analysis, insights };
  };

  const tabs = [
    { id: 'input', icon: <Calendar className="w-4 h-4" />, label: 'Input' },
    { id: 'daily', icon: <List className="w-4 h-4" />, label: 'Daily View' },
    { id: 'analytics', icon: <BarChart className="w-4 h-4" />, label: 'Analytics' }
  ];

  const renderTabs = () => (
    <div className="flex border-b mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeTab === tab.id 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const renderInputForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="3"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasPhone"
            checked={formData.hasPhone}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Has Cell Phone</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasTvOn"
            checked={formData.hasTvOn}
            onChange={handleChange}
            className="mr-2"
          />
          <label>TV On</label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add Entry
      </button>
    </form>
  );

  const renderDailyView = () => {
    const dailyEntries = entries.filter(entry => entry.date === selectedDate);
    
    return (
      <div>
        <div className="mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div className="space-y-4">
          {dailyEntries.map((entry, index) => (
            <div key={index} className="border p-4 rounded">
              <div className="grid grid-cols-2 gap-2">
                <div>Start: {entry.startTime}</div>
                <div>End: {entry.endTime}</div>
                <div>Duration: {entry.duration}</div>
                <div>Category: {entry.category}</div>
              </div>
              <div className="mt-2">Description: {entry.description}</div>
              <div className="mt-2 text-sm text-gray-600">
                {entry.hasPhone && "📱 Had phone"} 
                {entry.hasTvOn && " 📺 TV was on"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const { analysis, insights } = analyzeTime();
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Time Distribution</h3>
          <div className="space-y-2">
            {analysis.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.category}</span>
                <span className="text-gray-600">
                  {Math.floor(item.totalMinutes/60)}h {item.totalMinutes%60}m 
                  ({item.percentageOfDay}% of day)
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-blue-600">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTabs()}
          {activeTab === 'input' && renderInputForm()}
          {activeTab === 'daily' && renderDailyView()}
          {activeTab === 'analytics' && renderAnalytics()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
