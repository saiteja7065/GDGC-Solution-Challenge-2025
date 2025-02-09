import React, { useState } from 'react';

function Converter() {
  const [inputValue, setInputValue] = useState('');
  const [conversionType, setConversionType] = useState('cupsToLitres');
  const [result, setResult] = useState(null);

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('Please enter a valid number.');
      return;
    }
    let convertedValue;
    switch (conversionType) {
      case 'cupsToLitres':
        // Liquid conversion: 1 cup ≈ 0.236588 litres
        convertedValue = value * 0.236588;
        setResult(
          `${value} cup${value !== 1 ? 's' : ''} = ${convertedValue.toFixed(2)} litre${convertedValue !== 1 ? 's' : ''}`
        );
        break;
      case 'litresToCups':
        // Liquid conversion: 1 litre ≈ 4.22675 cups
        convertedValue = value * 4.22675;
        setResult(
          `${value} litre${value !== 1 ? 's' : ''} = ${convertedValue.toFixed(2)} cup${convertedValue !== 1 ? 's' : ''}`
        );
        break;
      case 'cupsToGrams':
        // Solid conversion: For many solids, 1 cup ≈ 120 grams
        convertedValue = value * 120;
        setResult(
          `${value} cup${value !== 1 ? 's' : ''} ≈ ${convertedValue.toFixed(2)} grams (for solid ingredients)`
        );
        break;
      case 'gramsToCups':
        // Solid conversion: 1 gram ≈ 1/120 cups
        convertedValue = value / 120;
        setResult(
          `${value} grams ≈ ${convertedValue.toFixed(2)} cup${convertedValue !== 1 ? 's' : ''} (for solid ingredients)`
        );
        break;
      default:
        setResult('Invalid conversion type');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Unit Converter</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Convert units of measurement for your recipes! Use litres for liquid items and grams for solid items or mixtures.
      </p>

      <div className="mb-4">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter value"
          className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <select
          value={conversionType}
          onChange={(e) => setConversionType(e.target.value)}
          className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="cupsToLitres">Cups to Litres (Liquids)</option>
          <option value="litresToCups">Litres to Cups (Liquids)</option>
          <option value="cupsToGrams">Cups to Grams (Solids)</option>
          <option value="gramsToCups">Grams to Cups (Solids)</option>
        </select>
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Convert
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-800 dark:text-gray-200">{result}</p>
        </div>
      )}
    </div>
  );
}

export default Converter;
