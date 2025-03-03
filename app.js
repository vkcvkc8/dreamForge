// Enhanced State Management with Fashion Design System
const adaptiveState = {
  userPreferences: {
    styleWeights: { ai: 0.5, realism: 0.5 },
    favoredStyles: [],
    bannedConcepts: ['explicit', 'violent', 'inappropriate'],
    creativity: 0.5,
    styleInfluence: 0.3
  },
  chatHistory: [],
  visualDNA: {
    colorPalette: [],
    compositionPatterns: [],
    interactions: 0
  },
  aestheticParams: {
    lightingPresets: [
      "dramatic-rim",
      "soft-diffused", 
      "golden-hour-glow"
    ],
    poseCatalog: [
      "dynamic-silhouette",
      "power-stance",
      "flowing-movement"  
    ],
    fabricSimulation: {
      flow: 0.7,
      transparency: 0.3,
      physics: "realistic-drape"
    }
  },
  swimwearFeatures: {
    supportSystem: ["racerback", "halter", "cross-strap"],
    coverageOptions: ["high-waist", "mid-rise", "sport-cut"],
    techMaterials: [
      "quick-dry mesh",
      "UV-protection fabric", 
      "recycled elastane"
    ]
  },
  designParams: {
    patternStyles: {
      "geo-modern": { complexity: 0.7, colorScheme: "modern" },
      "tropical": { complexity: 0.8, colorScheme: "vibrant" },
      "ombre": { complexity: 0.5, colorScheme: "gradient" }
    },
    sustainabilityMetrics: {
      waterSaved: 0,
      recycledPercent: 0,
      carbonFootprint: 0
    }
  }
};

const API_URL = 'https://text.pollinations.ai/';
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt/';

let uploadedImage = null;
let generationQueue = [];
let isGenerating = false;

// DOM Elements
const promptInput = document.getElementById('promptInput');
const enhanceBtn = document.getElementById('enhanceBtn');
const generateBtn = document.getElementById('generateBtn');
const chatHistoryDiv = document.getElementById('chatHistory');
const imageGrid = document.getElementById('imageGrid');
const imageCountSelect = document.getElementById('imageCount');
const creativitySlider = document.getElementById('creativitySlider');
const styleInfluenceSlider = document.getElementById('styleInfluenceSlider');
const learningStatus = document.getElementById('learningStatus');
const styleDNA = document.getElementById('styleDNA');

// Event Listeners
enhanceBtn.addEventListener('click', enhancePrompt);
generateBtn.addEventListener('click', generateSwimwearDesign);
creativitySlider.addEventListener('input', updateCreativity);
styleInfluenceSlider.addEventListener('input', updateStyleInfluence);

// Adaptive Learning Functions
function updateCreativity(e) {
  adaptiveState.userPreferences.creativity = parseFloat(e.target.value);
  updateStyleDNA();
}

function updateStyleInfluence(e) {
  adaptiveState.userPreferences.styleInfluence = parseFloat(e.target.value);
  updateStyleDNA();
}

function updateStyleDNA() {
  const style = calculateStyle();
  styleDNA.textContent = `${style.name} (${Math.round(style.confidence * 100)}% match)`;
}

function calculateStyle() {
  const creativity = adaptiveState.userPreferences.creativity;
  const influence = adaptiveState.userPreferences.styleInfluence;
  
  if (creativity > 0.7 && influence > 0.7) return { name: 'Abstract Expressionist', confidence: 0.9 };
  if (creativity > 0.7) return { name: 'Imaginative Realism', confidence: 0.8 };
  if (influence > 0.7) return { name: 'Artistic Enhancement', confidence: 0.85 };
  return { name: 'Natural Style', confidence: 0.75 };
}

function recordInteraction(type, data) {
  adaptiveState.visualDNA.interactions++;
  updateLearningStatus();
  
  if (type === 'download') {
    adaptiveState.userPreferences.favoredStyles.push(data.style.preset);
  }
  
  updateStyleDNA();
}

async function enhancePrompt() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    showError('Please enter a prompt first');
    return;
  }

  setLoading(enhanceBtn, true);
  
  try {
    const creativity = adaptiveState.userPreferences.creativity;
    const styleInfluence = adaptiveState.userPreferences.styleInfluence;
    
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant specialized in enhancing fashion design prompts.
                   Apply creativity level: ${creativity} and style influence: ${styleInfluence}.
                   Preferred styles: ${adaptiveState.userPreferences.favoredStyles.join(', ')}`,
        },
        ...adaptiveState.chatHistory,
        {
          role: "user", 
          content: `Enhance this swimwear design prompt to make it more detailed and artistic: ${prompt}`
        }
      ]
    });

    if (!completion || !completion.content) {
      throw new Error('Invalid response from enhancement service');
    }

    const enhancedPrompt = completion.content;

    adaptiveState.chatHistory.push({
      role: "user",
      content: prompt
    });
    
    adaptiveState.chatHistory.push({
      role: "assistant",
      content: enhancedPrompt
    });

    displayChatMessage(prompt, enhancedPrompt);
    promptInput.value = enhancedPrompt;
    
    chatHistoryDiv.classList.add('show');
    recordInteraction('enhance', { 
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt 
    });
    
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    showError('Failed to enhance prompt. Please try again.');
  } finally {
    setLoading(enhanceBtn, false);
  }
}

async function generateSwimwearDesign() {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    showError('Please enter a design prompt first');
    return;
  }

  setLoading(generateBtn, true);

  try {
    const designMode = document.getElementById('designMode').value;
    const supportSystem = document.getElementById('supportSystem').value;
    const coverageStyle = document.getElementById('coverageStyle').value;
    const material = document.getElementById('material').value;
    const patternStyle = document.getElementById('patternStyle').value;

    const enhancedPrompt = `Design a ${designMode} swimsuit with:
      - Support: ${supportSystem}
      - Coverage: ${coverageStyle}
      - Material: ${material}
      - Pattern: ${patternStyle}
      Additional details: ${prompt}`;

    const result = await websim.imageGen({
      prompt: enhancedPrompt,
      width: 1024,
      height: 768,
    });

    if (!result || !result.url) {
      throw new Error('Failed to generate image - invalid response');
    }

    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = `
      <div class="relative group">
        <img src="${result.url}" 
             class="w-full h-auto rounded-lg shadow-lg" 
             alt="Generated swimwear design">
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                    transition-opacity flex items-center justify-center gap-2">
          <button onclick="downloadImage('${result.url}')" 
                  class="bg-white text-gray-800 px-4 py-2 rounded-lg 
                         hover:bg-gray-100 transition-colors">
            ⬇️ Download
          </button>
        </div>
      </div>
    `;

    updateSustainabilityMetrics();
    recordInteraction('generate', {
      prompt: enhancedPrompt,
      settings: {
        designMode: document.getElementById('designMode').value,
        supportSystem: document.getElementById('supportSystem').value,
        coverageStyle: document.getElementById('coverageStyle').value,
        material: document.getElementById('material').value,
        patternStyle: document.getElementById('patternStyle').value
      }
    });

  } catch (error) {
    console.error('Design generation error:', error);
    showError('Failed to generate design. Please check your inputs and try again.');
    // Clear previous failed results
    document.getElementById('imageGrid').innerHTML = '';
  } finally {
    setLoading(generateBtn, false);
  }
}

function updateSustainabilityMetrics() {
  const material = document.getElementById('material').value;
  const metrics = calculateSustainabilityImpact(material);
  
  document.getElementById('waterSaved').textContent = `${metrics.water}L`;
  document.getElementById('recycledPercent').textContent = `${metrics.recycled}%`;
  document.getElementById('carbonFootprint').textContent = `${metrics.carbon}kg`;
}

function calculateSustainabilityImpact(material) {
  const baseMetrics = {
    'quick-dry': { water: 12, recycled: 60, carbon: 1.2 },
    'uv-protect': { water: 15, recycled: 40, carbon: 1.5 },
    'recycled': { water: 8, recycled: 95, carbon: 0.5 }
  };

  return baseMetrics[material] || { water: 10, recycled: 50, carbon: 1.0 };
}

function displayChatMessage(original, enhanced) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50';
  messageDiv.innerHTML = `
    <div class="text-gray-400 mb-2">Original: ${original}</div>
    <div class="text-green-400">Enhanced: ${enhanced}</div>
  `;
  chatHistoryDiv.appendChild(messageDiv);
}

function setLoading(button, isLoading) {
  const spinner = button.querySelector('.spinner');
  const icon = button.querySelector('svg:not(.spinner)');
  const text = button.querySelector('span');
  
  button.disabled = isLoading;
  
  if (spinner) spinner.classList.toggle('hidden', !isLoading);
  if (icon) icon.classList.toggle('hidden', isLoading);
  if (text) text.textContent = isLoading ? 'Processing...' : text.dataset.originalText || 'Process';
  
  button.classList.toggle('opacity-75', isLoading);
  button.classList.toggle('cursor-not-allowed', isLoading);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
  errorDiv.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>${message}</span>
    </div>
  `;
  
  const existingError = document.querySelector('.animate-fade-in');
  if (existingError) {
    existingError.remove();
  }
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.classList.add('animate-fade-out');
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `swimwear-design-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(downloadUrl);
    
    recordInteraction('download', {
      url,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Download failed:', error);
    showError('Failed to download image. Please try again.');
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      uploadedImage = e.target.result;
      
      // Show image preview
      const previewDiv = document.getElementById('uploadPreview');
      const previewImage = document.getElementById('previewImage');
      
      if (previewImage) {
        previewImage.src = uploadedImage;
      }
      
      // Show preview container
      previewDiv.classList.remove('hide');
      previewDiv.classList.add('show');
      
      // Record interaction
      recordInteraction('upload', { filename: file.name });
    };

    reader.onerror = function() {
      showError('Failed to read uploaded file');
    };
    
    reader.readAsDataURL(file);

  } catch (error) {
    console.error('Image upload error:', error);
    showError('Failed to process image upload');
  }
}

function removeUpload() {
  uploadedImage = null;
  
  // Hide and clear preview
  const previewDiv = document.getElementById('uploadPreview');
  previewDiv.classList.remove('show');
  previewDiv.classList.add('hide');
  
  // Clear file input
  const fileInput = document.getElementById('imageUpload');
  if (fileInput) {
    fileInput.value = '';
  }
  
  // Clear preview image
  const previewImage = document.getElementById('previewImage');
  if (previewImage) {
    previewImage.src = '';
  }

  // Record interaction
  recordInteraction('remove_upload');
}

// Initialize state tracking on page load
document.addEventListener('DOMContentLoaded', () => {
  // Get interaction count from localStorage or default to 0
  adaptiveState.visualDNA.interactions = parseInt(localStorage.getItem('interactions') || '0');
  updateLearningStatus();
});

// Update learning status in UI
function updateLearningStatus() {
  const learningStatus = document.getElementById('learningStatus');
  if (learningStatus) {
    learningStatus.textContent = `🧠 Learning from ${adaptiveState.visualDNA.interactions} interactions`;
  }
  // Save to localStorage
  localStorage.setItem('interactions', adaptiveState.visualDNA.interactions.toString());
}

promptInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

promptInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateSwimwearDesign();
  } else if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    enhancePrompt();
  }
});

updateStyleDNA();