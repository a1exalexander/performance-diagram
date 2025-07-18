# Performance Review Diagram

A React TypeScript application for creating interactive performance review radar charts. Users can evaluate skills across different categories and time periods, visualizing progress through customizable radar charts.

## Features

- **Interactive Radar Charts**: Visual representation of performance metrics using Recharts
- **Customizable Categories**: Pre-defined skill sets (Communication, Leadership, PM, Design, etc.)
- **Time Period Management**: Configure up to 12 periods with custom labels and colors
- **Data Persistence**: Automatic saving to localStorage
- **Chart Export**: Download charts as PNG images
- **Responsive Data Input**: Table-based interface for entering scores (0-10 scale)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd performance-review-diagram

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Preview production build
pnpm preview
```

## Usage

1. **Select Category**: Choose from predefined skill categories (well-being, communication, english, leadership, PM, etc.)
2. **Configure Periods**: Edit time period labels (defaults to quarterly format)
3. **Enter Scores**: Input numerical values (0-10) for each skill/period combination
4. **View Chart**: Interactive radar chart updates automatically
5. **Export**: Download chart as PNG image

## Project Structure

```
src/
├── App.tsx              # Main application component
├── App.module.css       # Component styles
├── data/
│   ├── categories.ts    # Skill categories and evaluation criteria
│   └── colors.ts        # Color palette for chart periods
├── main.tsx            # Application entry point
└── main.css            # Global styles
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Recharts** - Chart visualization
- **html2canvas** - Chart export functionality
- **usehooks-ts** - React hooks utilities
- **Lodash** - Data manipulation
- **date-fns** - Date formatting

## Configuration

### Adding New Categories

Edit `src/data/categories.ts` to add new skill categories:

```typescript
{
  name: "new-category",
  options: [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ]
}
```

### Customizing Colors

Modify `src/data/colors.ts` to change chart colors:

```typescript
export const colors: string[] = [
  "#FF6384",
  "#36A2EB",
  // Add more colors as needed
];
```

## Data Storage

All user data is stored in localStorage:
- `activeSubject`: Currently selected category
- `periods`: Time period configurations
- `subjects`: Active skill list
- `marks`: Score data

## License

MIT