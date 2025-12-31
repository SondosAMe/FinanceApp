# Financial Budget Tracker

A comprehensive, single-page web application for tracking income, expenses, budgets, and financial goals. Built with vanilla JavaScript, HTML, and CSS.

## Features

### Core Functionality
- **Income Tracking**: Add multiple income sources per month with custom names
- **Transaction Management**: Track spending with date, category, and description
- **Fixed Costs**: Create and manage recurring expense templates (Car Payment, Gas, Phone bill, etc.)
- **Budget Limits**: Set monthly budget limits for spending categories (Shopping, Food, Other)
- **Goal Tracking**: Set financial goals (e.g., iPhone) with target amounts and track progress
- **Savings Calculation**: Automatic calculation of monthly savings (Income - Spending - Fixed Costs)

### Visualizations
- **Pie Chart**: Spending breakdown by category
- **Bar Chart**: Budget vs actual spending comparison
- **Line Chart**: Monthly savings trend over time
- **Progress Bars**: Goal progress and budget status indicators
- **Calendar View**: Monthly calendar with color-coded daily spending (darker = more spending)

### Advanced Features
- **Day Breakdown**: Click any calendar day to see detailed transaction breakdown
- **Month Navigation**: View and manage data for any month
- **Data Persistence**: All data stored in browser localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Editable Templates**: Create, edit, and delete fixed cost templates

## Getting Started

### Installation

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. No build process or server required - it's a static website!

### Add to iPhone Home Screen

**Quick Method:**
1. Host your app online (see `IPHONE_SETUP.md` for options)
2. Open the URL in **Safari** on iPhone
3. Tap Share button → "Add to Home Screen"
4. Done! Works like a native app.

See `IPHONE_SETUP.md` or `QUICK_START_IPHONE.md` for detailed instructions.

### Usage

1. **Set Monthly Income**:
   - Enter income source name (e.g., "Salary", "Freelance")
   - Enter amount
   - Click "Add Income"
   - You can add multiple income sources per month

2. **Add Transactions**:
   - Enter amount, date, category, and optional description
   - Click "Add Transaction"
   - Transactions appear in the calendar and transaction history

3. **Use Fixed Costs**:
   - Click a fixed cost template button to quickly add it as a transaction
   - Click the edit icon (pencil) to modify the template amount
   - Click the delete icon (trash) to remove a template
   - Add new templates using the form above the templates

4. **Set Budget Limits**:
   - Enter budget amounts for Shopping, Food, and Other categories
   - Click "Save" for each category
   - View budget status in progress bars and bar chart

5. **Track Goals**:
   - Enter goal name and target amount
   - Click "Add Goal"
   - Add money to goals using the "Add" button
   - View progress in the progress bars section

6. **View Calendar**:
   - See daily spending color-coded on the calendar
   - Click any day to see detailed transaction breakdown
   - Days with more spending appear darker

7. **Navigate Months**:
   - Use the month selector in the header
   - View historical data for any month
   - All data is preserved

## File Structure

```
FinanceApp/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styling
├── scripts/
│   ├── app.js             # Main application logic and event handlers
│   ├── dataManager.js     # localStorage operations and data utilities
│   ├── transactionManager.js  # Transaction CRUD operations
│   ├── budgetCalculator.js    # Budget and financial calculations
│   ├── chartRenderer.js       # Chart.js visualizations
│   └── uiController.js        # UI rendering and updates
└── README.md              # This file
```

## Technical Details

### Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and responsive design
- **Vanilla JavaScript**: No frameworks - pure JavaScript
- **Chart.js**: Data visualizations (loaded via CDN)
- **localStorage**: Client-side data persistence

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with localStorage support

### Data Storage
- All data is stored in browser localStorage
- Data persists across browser sessions
- Data is specific to the browser/device
- No server or database required

### Data Structure
```javascript
{
  income: {
    "2024-01": [
      { id: "...", source: "Salary", amount: 5000 },
      { id: "...", source: "Freelance", amount: 1000 }
    ]
  },
  transactions: [
    { id: "...", date: "2024-01-15", amount: 50, category: "Food", description: "Groceries", type: "spending" }
  ],
  budgets: {
    "2024-01": { Shopping: 500, Food: 800, Other: 300 }
  },
  goals: [
    { id: "...", name: "iPhone", targetAmount: 1000, currentAmount: 250 }
  ],
  fixedCostTemplates: [
    { id: "...", name: "Car Payment", amount: 300 }
  ]
}
```

## Features in Detail

### Categories
- **Spending**: Shopping, Food, Other
- **Fixed Costs**: Customizable templates (default: Car Payment, Gas, Phone bill)
- **Goals**: Custom goals with target amounts

### Charts
1. **Pie Chart**: Shows percentage breakdown of spending by category
2. **Bar Chart**: Compares budget limits vs actual spending
3. **Line Chart**: Shows savings trend across all tracked months
4. **Progress Bars**: 
   - Goal progress (current vs target)
   - Budget status (spent vs limit) with color coding:
     - Green: Under budget
     - Yellow: Warning (80%+ of budget)
     - Red: Over budget

### Calendar
- Color intensity indicates spending amount
- Click any day to see transaction details
- Shows total spending per day
- Responsive grid layout

## Tips

1. **Backup Data**: Since data is stored in localStorage, consider exporting important data periodically
2. **Multiple Income Sources**: Add all your income sources for accurate savings calculation
3. **Regular Updates**: Update transactions regularly for accurate budget tracking
4. **Goal Tracking**: Add money to goals whenever you save to track progress
5. **Budget Planning**: Set realistic budget limits based on your spending history

## Troubleshooting

### Data Not Saving
- Ensure localStorage is enabled in your browser
- Check browser console for errors
- Try clearing browser cache and reloading

### Charts Not Displaying
- Ensure internet connection (Chart.js loads from CDN)
- Check browser console for JavaScript errors
- Try refreshing the page

### Calendar Not Showing
- Ensure you have transactions with dates
- Check that dates are in YYYY-MM-DD format
- Try switching months

## Future Enhancements (Potential)

- Data export/import (JSON)
- Multiple currency support
- Recurring transaction automation
- Category customization
- Data backup to cloud
- Dark mode toggle
- Transaction search and filtering

## License

This project is open source and available for personal use.

## Support

For issues or questions, check the browser console for error messages. The application uses console.error and console.warn for debugging.

---

**Version**: 1.0.0  
**Last Updated**: December 2024

