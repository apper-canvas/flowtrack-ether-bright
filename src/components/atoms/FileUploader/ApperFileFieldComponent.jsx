import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State management
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false)
  const elementIdRef = useRef(elementId)
  const existingFilesRef = useRef([])

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId
  }, [elementId])

  // Memoized existingFiles to prevent unnecessary re-renders
    const memoizedExistingFiles = useMemo(() => {
      return config.existingFiles || [];
    }, [
      config.existingFiles?.length,
      config.existingFiles?.[0]?.Id || config.existingFiles?.[0]?.id
    ]);

  // Initial Mount Effect
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 50
    
    const initializeSDK = async () => {
      while (attempts < maxAttempts && !mountedRef.current) {
        try {
          if (window.ApperSDK && window.ApperSDK.ApperFileUploader) {
            const { ApperFileUploader } = window.ApperSDK
            
            elementIdRef.current = `file-uploader-${elementId}`
            
            await ApperFileUploader.FileField.mount(elementIdRef.current, {
              ...config,
              existingFiles: memoizedExistingFiles
            })
            
            mountedRef.current = true
            setIsReady(true)
            setError(null)
            existingFilesRef.current = memoizedExistingFiles
            return
          }
        } catch (err) {
          console.error('Error mounting ApperFileUploader:', err)
          setError(`Failed to mount file uploader: ${err.message}`)
          return
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      if (!mountedRef.current) {
        const errorMessage = 'ApperSDK not loaded after 5 seconds. Please ensure the SDK script is included before this component.'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    }
    
    initializeSDK()
    
    // Cleanup on component destruction
    return () => {
      try {
        if (window.ApperSDK && window.ApperSDK.ApperFileUploader && elementIdRef.current) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current)
        }
      } catch (err) {
        console.error('Error unmounting file uploader:', err)
      }
      
      mountedRef.current = false
      setIsReady(false)
      existingFilesRef.current = []
    }
  }, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey])

  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) {
      return
    }

    // Deep equality check with JSON.stringify
    const currentFilesStr = JSON.stringify(memoizedExistingFiles)
    const previousFilesStr = JSON.stringify(existingFilesRef.current)
    
    if (currentFilesStr === previousFilesStr) {
      return
    }

    try {
      const { ApperFileUploader } = window.ApperSDK
      
      // Format detection - check for .Id vs .id property
      let filesToUpdate = memoizedExistingFiles
      
      if (memoizedExistingFiles.length > 0) {
        const firstFile = memoizedExistingFiles[0]
        // If files have .Id property, convert to UI format
        if (firstFile.Id !== undefined && firstFile.id === undefined) {
          filesToUpdate = ApperFileUploader.toUIFormat(memoizedExistingFiles)
        }
      }
      
      // Update files or clear field based on content
      if (filesToUpdate.length > 0) {
        ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate)
      } else {
        ApperFileUploader.FileField.clearField(config.fieldKey)
      }
      
      existingFilesRef.current = memoizedExistingFiles
    } catch (err) {
      console.error('Error updating files:', err)
      setError(`Failed to update files: ${err.message}`)
    }
  }, [memoizedExistingFiles, isReady, config.fieldKey])

  // Error UI
  if (error) {
    return (
      <motion.div 
        className="p-4 bg-error-50 border border-error-200 rounded-lg"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <ApperIcon name="AlertCircle" className="w-5 h-5 text-error-500" />
          <div>
            <h3 className="text-sm font-medium text-error-800">File Upload Error</h3>
            <p className="text-sm text-error-600 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-2">
      <div 
        id={`file-uploader-${elementId}`}
        className="relative min-h-[100px] border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 transition-colors hover:border-slate-400 hover:bg-slate-100"
      >
        {!isReady && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2 text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              <span className="text-sm">Loading file uploader...</span>
            </div>
          </motion.div>
        )}
      </div>
      
      {config.fileCount > 0 && (
        <p className="text-xs text-slate-500">
          Maximum {config.fileCount} files allowed
        </p>
      )}
    </div>
  )
}

export default ApperFileFieldComponent