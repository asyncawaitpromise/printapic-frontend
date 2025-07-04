import { mockHttpClient, simulateDelay, shouldSimulateError } from '../config/mockApi';
import { MOCK_WORKFLOWS, MOCK_PROCESSING_STATUSES, MOCK_RESULT_IMAGES } from '../mocks/workflowMocks';

/**
 * AI Service for photo processing with mock implementation
 */
class AIService {
  constructor() {
    this.httpClient = mockHttpClient;
    this.activeJobs = new Map(); // Track active processing jobs
  }

  /**
   * Get available AI workflows
   * @returns {Promise<Array>} - Array of available workflows
   */
  async getAvailableWorkflows() {
    try {
      console.log('🤖 Fetching available AI workflows...');
      
      await simulateDelay('processing');
      
      if (shouldSimulateError('processing')) {
        throw new Error('Failed to fetch workflows');
      }

      console.log('🤖 Workflows fetched successfully:', MOCK_WORKFLOWS.length);
      return {
        success: true,
        data: MOCK_WORKFLOWS
      };
    } catch (error) {
      console.error('🤖 Error fetching workflows:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload photo for processing
   * @param {string} photoData - Base64 photo data
   * @param {Object} metadata - Photo metadata
   * @returns {Promise<Object>} - Upload response with photo ID
   */
  async uploadPhoto(photoData, metadata = {}) {
    try {
      console.log('📤 Uploading photo for AI processing...');
      
      await simulateDelay('upload');
      
      if (shouldSimulateError('upload')) {
        throw new Error('Photo upload failed');
      }

      const photoId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Store photo data locally for mock processing
      const photoInfo = {
        id: photoId,
        data: photoData,
        metadata,
        uploadedAt: new Date().toISOString()
      };

      console.log('📤 Photo uploaded successfully:', photoId);
      
      return {
        success: true,
        data: {
          photoId,
          status: 'uploaded',
          uploadUrl: `https://mock-storage.com/${photoId}.jpg`
        }
      };
    } catch (error) {
      console.error('📤 Photo upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process photo with AI workflow
   * @param {string} photoId - Photo ID from upload
   * @param {string} workflowId - AI workflow ID
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Processing job response
   */
  async processPhoto(photoId, workflowId, options = {}) {
    try {
      console.log('🎯 Starting AI processing:', { photoId, workflowId, options });
      
      await simulateDelay('processing');
      
      if (shouldSimulateError('processing')) {
        throw new Error('AI processing failed to start');
      }

      const workflow = MOCK_WORKFLOWS.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Create processing job
      const job = {
        id: jobId,
        photoId,
        workflowId,
        workflow,
        options,
        status: 'queued',
        progress: 0,
        startedAt: new Date().toISOString(),
        estimatedTime: workflow.estimatedTime,
        tokenCost: workflow.tokenCost
      };

      // Store active job
      this.activeJobs.set(jobId, job);

      // Start mock processing
      this.startMockProcessing(jobId);

      console.log('🎯 AI processing job created:', jobId);
      
      return {
        success: true,
        data: {
          jobId,
          status: 'queued',
          estimatedTime: workflow.estimatedTime,
          queuePosition: Math.floor(Math.random() * 3) + 1,
          tokenCost: workflow.tokenCost,
          workflow: {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description
          }
        }
      };
    } catch (error) {
      console.error('🎯 AI processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get processing status for a job
   * @param {string} jobId - Processing job ID
   * @returns {Promise<Object>} - Job status response
   */
  async getProcessingStatus(jobId) {
    try {
      await simulateDelay('status_check');
      
      const job = this.activeJobs.get(jobId);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      console.log('📊 Checking processing status:', jobId, job.status);
      
      return {
        success: true,
        data: {
          jobId,
          status: job.status,
          progress: job.progress,
          message: this.getStatusMessage(job.status, job.progress),
          estimatedTimeRemaining: job.estimatedTimeRemaining || 0,
          workflow: job.workflow
        }
      };
    } catch (error) {
      console.error('📊 Status check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download processed result
   * @param {string} jobId - Processing job ID
   * @returns {Promise<Object>} - Result with processed image
   */
  async downloadResult(jobId) {
    try {
      console.log('💾 Downloading processing result:', jobId);
      
      await simulateDelay('download');
      
      const job = this.activeJobs.get(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'completed') {
        throw new Error('Processing not completed yet');
      }

      // Get mock result image
      const resultImage = MOCK_RESULT_IMAGES[job.workflowId] || MOCK_RESULT_IMAGES.enhance_colors;
      
      console.log('💾 Result downloaded successfully:', jobId);
      
      return {
        success: true,
        data: {
          jobId,
          originalPhotoId: job.photoId,
          processedImageUrl: resultImage,
          processedImageData: resultImage,
          workflow: job.workflow,
          metadata: {
            processedAt: new Date().toISOString(),
            processingTime: job.workflow.estimatedTime,
            tokenCost: job.workflow.tokenCost
          }
        }
      };
    } catch (error) {
      console.error('💾 Download error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel processing job
   * @param {string} jobId - Processing job ID
   * @returns {Promise<Object>} - Cancellation response
   */
  async cancelProcessing(jobId) {
    try {
      console.log('❌ Cancelling processing job:', jobId);
      
      const job = this.activeJobs.get(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status === 'completed') {
        throw new Error('Cannot cancel completed job');
      }

      // Update job status
      job.status = 'cancelled';
      job.cancelledAt = new Date().toISOString();

      console.log('❌ Processing job cancelled:', jobId);
      
      return {
        success: true,
        data: {
          jobId,
          status: 'cancelled',
          message: 'Processing cancelled successfully'
        }
      };
    } catch (error) {
      console.error('❌ Cancellation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start mock processing simulation
   * @param {string} jobId - Job ID to process
   */
  startMockProcessing(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    // Start processing
    setTimeout(() => {
      if (job.status === 'cancelled') return;
      
      job.status = 'processing';
      job.progress = 10;
      job.estimatedTimeRemaining = job.estimatedTime * 0.9;
    }, 2000);

    // Progress updates
    const progressInterval = setInterval(() => {
      if (!this.activeJobs.has(jobId) || job.status === 'cancelled') {
        clearInterval(progressInterval);
        return;
      }

      if (job.status === 'processing' && job.progress < 90) {
        job.progress += Math.floor(Math.random() * 20) + 10;
        job.estimatedTimeRemaining = Math.max(0, job.estimatedTimeRemaining - 2000);
      }
    }, 2000);

    // Complete processing
    setTimeout(() => {
      if (job.status === 'cancelled') return;
      
      clearInterval(progressInterval);
      job.status = 'completed';
      job.progress = 100;
      job.estimatedTimeRemaining = 0;
      job.completedAt = new Date().toISOString();
      
      console.log('✅ Mock processing completed:', jobId);
    }, job.estimatedTime);
  }

  /**
   * Get status message for current job state
   * @param {string} status - Job status
   * @param {number} progress - Progress percentage
   * @returns {string} - Status message
   */
  getStatusMessage(status, progress) {
    switch (status) {
      case 'queued':
        return 'Your photo is in the processing queue';
      case 'processing':
        if (progress < 30) return 'AI is analyzing your photo';
        if (progress < 60) return 'Applying AI enhancements';
        if (progress < 90) return 'Finalizing processed image';
        return 'Almost done!';
      case 'completed':
        return 'Processing complete! Your enhanced photo is ready.';
      case 'failed':
        return 'Processing failed. Please try again.';
      case 'cancelled':
        return 'Processing was cancelled.';
      default:
        return 'Processing status unknown';
    }
  }

  /**
   * Get all active jobs for debugging
   * @returns {Array} - Array of active jobs
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Clear completed jobs from memory
   */
  clearCompletedJobs() {
    for (const [jobId, job] of this.activeJobs.entries()) {
      if (job.status === 'completed' || job.status === 'cancelled') {
        this.activeJobs.delete(jobId);
      }
    }
  }
}

// Create and export singleton instance
export const aiService = new AIService();
export default aiService; 