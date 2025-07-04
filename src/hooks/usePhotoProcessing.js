import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService } from '../services/aiService';

/**
 * Custom hook for managing photo processing with AI workflows
 * @param {Object} options - Configuration options
 * @returns {Object} - Processing state and methods
 */
export const usePhotoProcessing = (options = {}) => {
  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [processingJobs, setProcessingJobs] = useState(new Map());
  const [error, setError] = useState(null);
  
  // Refs for cleanup
  const statusIntervals = useRef(new Map());
  const isMounted = useRef(true);

  // Load available workflows on mount
  useEffect(() => {
    loadWorkflows();
    
    return () => {
      isMounted.current = false;
      // Clear all status check intervals
      statusIntervals.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  /**
   * Load available AI workflows
   */
  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    setError(null);
    
    try {
      const response = await aiService.getAvailableWorkflows();
      
      if (response.success) {
        setWorkflows(response.data);
        console.log('📋 Workflows loaded:', response.data.length);
      } else {
        throw new Error(response.error || 'Failed to load workflows');
      }
    } catch (err) {
      console.error('📋 Error loading workflows:', err);
      setError(err.message);
    } finally {
      setLoadingWorkflows(false);
    }
  }, []);

  /**
   * Start processing a photo with a workflow
   * @param {string} photoId - Photo ID
   * @param {string} workflowId - Workflow ID
   * @param {Object} processingOptions - Additional options
   * @returns {Promise<string>} - Job ID
   */
  const startProcessing = useCallback(async (photoId, workflowId, processingOptions = {}) => {
    setError(null);
    
    try {
      console.log('🚀 Starting photo processing:', { photoId, workflowId });
      
      const response = await aiService.processPhoto(photoId, workflowId, processingOptions);
      
      if (response.success) {
        const { jobId, ...jobData } = response.data;
        
        // Add job to processing state
        setProcessingJobs(prev => {
          const newJobs = new Map(prev);
          newJobs.set(jobId, {
            ...jobData,
            photoId,
            workflowId,
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
          return newJobs;
        });
        
        // Start status monitoring
        startStatusMonitoring(jobId);
        
        console.log('🚀 Processing started:', jobId);
        return jobId;
      } else {
        throw new Error(response.error || 'Failed to start processing');
      }
    } catch (err) {
      console.error('🚀 Error starting processing:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Start monitoring job status
   * @param {string} jobId - Job ID to monitor
   */
  const startStatusMonitoring = useCallback((jobId) => {
    // Clear existing interval if any
    if (statusIntervals.current.has(jobId)) {
      clearInterval(statusIntervals.current.get(jobId));
    }
    
    const checkStatus = async () => {
      if (!isMounted.current) return;
      
      try {
        const response = await aiService.getProcessingStatus(jobId);
        
        if (response.success) {
          const statusData = response.data;
          
          setProcessingJobs(prev => {
            const newJobs = new Map(prev);
            const existingJob = newJobs.get(jobId);
            
            if (existingJob) {
              newJobs.set(jobId, {
                ...existingJob,
                ...statusData,
                lastUpdated: new Date().toISOString()
              });
            }
            
            return newJobs;
          });
          
          // Stop monitoring if job is completed or failed
          if (statusData.status === 'completed' || statusData.status === 'failed') {
            clearInterval(statusIntervals.current.get(jobId));
            statusIntervals.current.delete(jobId);
            
            // If completed, download the result
            if (statusData.status === 'completed') {
              downloadResult(jobId);
            }
          }
        }
      } catch (err) {
        console.error('📊 Error checking status for job:', jobId, err);
      }
    };
    
    // Check immediately, then every 2 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    statusIntervals.current.set(jobId, interval);
  }, []);

  /**
   * Download processing result
   * @param {string} jobId - Job ID
   */
  const downloadResult = useCallback(async (jobId) => {
    try {
      console.log('💾 Downloading result for job:', jobId);
      
      const response = await aiService.downloadResult(jobId);
      
      if (response.success) {
        const resultData = response.data;
        
        setProcessingJobs(prev => {
          const newJobs = new Map(prev);
          const existingJob = newJobs.get(jobId);
          
          if (existingJob) {
            newJobs.set(jobId, {
              ...existingJob,
              result: resultData,
              downloadedAt: new Date().toISOString()
            });
          }
          
          return newJobs;
        });
        
        console.log('💾 Result downloaded successfully:', jobId);
        return resultData;
      } else {
        throw new Error(response.error || 'Failed to download result');
      }
    } catch (err) {
      console.error('💾 Error downloading result:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Cancel a processing job
   * @param {string} jobId - Job ID to cancel
   */
  const cancelProcessing = useCallback(async (jobId) => {
    try {
      console.log('❌ Cancelling job:', jobId);
      
      // Clear status monitoring
      if (statusIntervals.current.has(jobId)) {
        clearInterval(statusIntervals.current.get(jobId));
        statusIntervals.current.delete(jobId);
      }
      
      // Update job status locally
      setProcessingJobs(prev => {
        const newJobs = new Map(prev);
        const existingJob = newJobs.get(jobId);
        
        if (existingJob) {
          newJobs.set(jobId, {
            ...existingJob,
            status: 'cancelled',
            cancelledAt: new Date().toISOString()
          });
        }
        
        return newJobs;
      });
      
      console.log('❌ Job cancelled:', jobId);
    } catch (err) {
      console.error('❌ Error cancelling job:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Remove a job from the processing list
   * @param {string} jobId - Job ID to remove
   */
  const removeJob = useCallback((jobId) => {
    // Clear status monitoring
    if (statusIntervals.current.has(jobId)) {
      clearInterval(statusIntervals.current.get(jobId));
      statusIntervals.current.delete(jobId);
    }
    
    setProcessingJobs(prev => {
      const newJobs = new Map(prev);
      newJobs.delete(jobId);
      return newJobs;
    });
  }, []);

  /**
   * Clear all completed jobs
   */
  const clearCompletedJobs = useCallback(() => {
    setProcessingJobs(prev => {
      const newJobs = new Map();
      
      prev.forEach((job, jobId) => {
        if (job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled') {
          newJobs.set(jobId, job);
        } else {
          // Clear status monitoring for removed jobs
          if (statusIntervals.current.has(jobId)) {
            clearInterval(statusIntervals.current.get(jobId));
            statusIntervals.current.delete(jobId);
          }
        }
      });
      
      return newJobs;
    });
  }, []);

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {Object|null} - Job data or null
   */
  const getJob = useCallback((jobId) => {
    return processingJobs.get(jobId) || null;
  }, [processingJobs]);

  /**
   * Get jobs by status
   * @param {string} status - Job status
   * @returns {Array} - Array of jobs
   */
  const getJobsByStatus = useCallback((status) => {
    return Array.from(processingJobs.values()).filter(job => job.status === status);
  }, [processingJobs]);

  /**
   * Get processing statistics
   * @returns {Object} - Processing stats
   */
  const getProcessingStats = useCallback(() => {
    const jobs = Array.from(processingJobs.values());
    
    return {
      total: jobs.length,
      queued: jobs.filter(j => j.status === 'queued').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length
    };
  }, [processingJobs]);

  return {
    // Workflows
    workflows,
    loadingWorkflows,
    loadWorkflows,
    
    // Processing jobs
    processingJobs: Array.from(processingJobs.values()),
    processingJobsMap: processingJobs,
    
    // Actions
    startProcessing,
    cancelProcessing,
    removeJob,
    clearCompletedJobs,
    downloadResult,
    
    // Getters
    getJob,
    getJobsByStatus,
    getProcessingStats,
    
    // State
    error,
    setError
  };
}; 