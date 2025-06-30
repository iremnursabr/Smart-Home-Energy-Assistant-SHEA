const replace = require('replace-in-file');

try {
  // timeSeriesData değişkenini tamamen kaldır
  const resultTimeSeriesData = replace.sync({
    files: 'src/pages/EnergyConsumption.tsx',
    from: /\/\/ Prepare line\/bar chart data\s+const timeSeriesData = {[\s\S]*?};/g,
    to: '// Cihaz bazlı tüketim verisi kullanılıyor, zaman serisi verisi kaldırıldı',
  });

  // Başlık değişikliği
  const resultChartTitle = replace.sync({
    files: 'src/pages/EnergyConsumption.tsx',
    from: /\{t\('consumption\.consumptionOverTime'\)\}/g,
    to: '{t(\'consumption.consumptionByDevice\')}',
  });

  // Grafik verisi değişikliği
  const resultChartData = replace.sync({
    files: 'src/pages/EnergyConsumption.tsx',
    from: /<Line data=\{timeSeriesData\} options=\{chartOptions\} \/>/g,
    to: '<Line data={deviceConsumptionChartData} options={chartOptions} />',
  });

  const resultBarChartData = replace.sync({
    files: 'src/pages/EnergyConsumption.tsx',
    from: /<Bar data=\{timeSeriesData\} options=\{chartOptions\} \/>/g,
    to: '<Bar data={deviceConsumptionChartData} options={chartOptions} />',
  });

  // chartOptions başlığını değiştir
  const resultChartOptions = replace.sync({
    files: 'src/pages/EnergyConsumption.tsx',
    from: /text: t\('consumption\.consumptionOverTime'\),/g,
    to: 'text: t(\'consumption.consumptionByDevice\'),',
  });
  
  console.log('Değişiklikler uygulandı!');
  console.log(`timeSeriesData: ${resultTimeSeriesData.length > 0 && resultTimeSeriesData[0].hasChanged ? 'değiştirildi' : 'değiştirilmedi'}`);
  console.log(`Chart başlık: ${resultChartTitle.length > 0 && resultChartTitle[0].hasChanged ? 'değiştirildi' : 'değiştirilmedi'}`);
  console.log(`Line chart verisi: ${resultChartData.length > 0 && resultChartData[0].hasChanged ? 'değiştirildi' : 'değiştirilmedi'}`);
  console.log(`Bar chart verisi: ${resultBarChartData.length > 0 && resultBarChartData[0].hasChanged ? 'değiştirildi' : 'değiştirilmedi'}`);
  console.log(`Chart options: ${resultChartOptions.length > 0 && resultChartOptions[0].hasChanged ? 'değiştirildi' : 'değiştirilmedi'}`);

  console.log('\nDetaylı sonuçlar:');
  console.log('timeSeriesData:', JSON.stringify(resultTimeSeriesData, null, 2));
  console.log('Chart başlık:', JSON.stringify(resultChartTitle, null, 2));
  console.log('Line chart verisi:', JSON.stringify(resultChartData, null, 2));
  console.log('Bar chart verisi:', JSON.stringify(resultBarChartData, null, 2));
  console.log('Chart options:', JSON.stringify(resultChartOptions, null, 2));
} catch (error) {
  console.error('Hata oluştu:', error);
} 