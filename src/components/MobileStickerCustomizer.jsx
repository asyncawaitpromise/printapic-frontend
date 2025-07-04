import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowLeft, Clock, Download, Eye, AlertCircle } from 'react-feather';
import { usePhotoProcessing } from '../hooks/usePhotoProcessing';

const MobileStickerCustomizer = ({ 
  photo, 
  isOpen, 
  onClose, 
  onComplete,
  className = '' 
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');
  const [activeJobId, setActiveJobId] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);

  const {
    workflows,
    loadingWorkflows,
    processingJobs,
    startProcessing,
    error: processingError,
    setError,
    getJob
  } = usePhotoProcessing();

  useEffect(() => {
    if (activeJobId) {
      const job = getJob(activeJobId);
      if (job) {
        if (job.status === 'completed' && job.result) {
          setProcessingResult(job.result);
          setCurrentStep('result');
        } else if (job.status === 'failed') {
          setError('Processing failed. Please try again.');
          setCurrentStep('select');
          setActiveJobId(null);
        }
      }
    }
  }, [processingJobs, activeJobId, getJob, setError]);

  const handleWorkflowSelect = async (workflow) => {
    if (!photo) return;
    
    setSelectedWorkflow(workflow);
    setCurrentStep('processing');
    setError(null);

    try {
      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }

      const jobId = await startProcessing(photo.id, workflow.id);
      setActiveJobId(jobId);
      
    } catch (err) {
      setCurrentStep('select');
      setSelectedWorkflow(null);
    }
  };

  const handleSaveResult = () => {
    if (processingResult && onComplete) {
      const processedPhoto = {
        id: `processed_${Date.now()}`,
        data: processingResult.processedImageData,
        source: 'ai_processed',
        timestamp: new Date().toISOString(),
        metadata: {
          ...photo.metadata,
          originalPhotoId: photo.id,
          workflow: selectedWorkflow
        }
      };

      onComplete(processedPhoto);
      onClose();
    }
  };

  const formatEstimatedTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  const getCurrentJob = () => {
    return activeJobId ? getJob(activeJobId) : null;
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 ${className}`}>
      <div className="bg-base-100 w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            {currentStep !== 'select' && (
              <button
                onClick={() => setCurrentStep('select')}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {currentStep === 'select' && 'Choose AI Style'}
                {currentStep === 'processing' && 'Processing...'}
                {currentStep === 'result' && 'Your Enhanced Photo'}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          
          {photo && (
            <div className="mb-6">
              <div className="aspect-square bg-base-200 rounded-lg overflow-hidden">
                <img
                  src={currentStep === 'result' && processingResult 
                    ? processingResult.processedImageData 
                    : photo.data
                  }
                  alt="Photo to process"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {processingError && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={20} />
              <span>{processingError}</span>
            </div>
          )}

          {currentStep === 'select' && (
            <div>
              <h4 className="text-md font-semibold mb-4">Select AI Enhancement</h4>
              
              {loadingWorkflows ? (
                <div className="text-center py-8">
                  <div className="loading loading-spinner loading-lg"></div>
                  <p className="text-sm text-base-content/70 mt-2">Loading AI workflows...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {workflows.map((workflow) => (
                    <button
                      key={workflow.id}
                      onClick={() => handleWorkflowSelect(workflow)}
                      className="btn btn-outline btn-lg h-auto p-4 justify-start text-left"
                      style={{ borderColor: workflow.color }}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: workflow.color + '20', color: workflow.color }}
                        >
                          {workflow.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{workflow.name}</div>
                          <div className="text-sm opacity-70">{workflow.description}</div>
                          <div className="flex items-center gap-4 mt-1 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatEstimatedTime(workflow.estimatedTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap size={12} />
                              {workflow.tokenCost} tokens
                            </span>
                          </div>
                        </div>
                        <Zap size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                {getCurrentJob()?.progress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {getCurrentJob()?.progress}%
                    </span>
                  </div>
                )}
              </div>
              
              <h4 className="text-lg font-semibold mb-2">
                {getCurrentJob()?.message || 'Processing your photo...'}
              </h4>
              
              {getCurrentJob()?.progress > 0 && (
                <div className="w-full bg-base-300 rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getCurrentJob().progress}%` }}
                  ></div>
                </div>
              )}
              
              <p className="text-xs text-base-content/60">
                ✨ Our AI is working its magic on your photo
              </p>
            </div>
          )}

          {currentStep === 'result' && processingResult && (
            <div>
              <div className="bg-success/20 p-4 rounded-lg mb-6 text-center">
                <div className="text-success font-semibold mb-1">
                  🎉 Processing Complete!
                </div>
                <div className="text-sm text-base-content/70">
                  Your photo has been enhanced with {selectedWorkflow?.name}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSaveResult}
                  className="btn btn-primary flex-1 gap-2"
                >
                  <Download size={18} />
                  Save Enhanced Photo
                </button>
                <button
                  onClick={() => setCurrentStep('select')}
                  className="btn btn-outline gap-2"
                >
                  <Zap size={18} />
                  Try Another Style
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileStickerCustomizer; 