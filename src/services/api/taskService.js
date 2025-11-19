import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

const tableName = "tasks_c"

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      }

      const response = await apperClient.fetchRecords(tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error)
      toast.error("Failed to fetch tasks")
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      }

      const response = await apperClient.getRecordById(tableName, parseInt(id), params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
      toast.error("Failed to fetch task")
      return null
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      // Map UI field names to database field names and filter only Updateable fields
      const params = {
        records: [{
          Name: taskData.title_c || taskData.title || "Untitled Task",
          Tags: taskData.Tags || "",
          title_c: taskData.title_c || taskData.title || "",
          description_c: taskData.description_c || taskData.description || "",
          priority_c: taskData.priority_c || taskData.priority || "medium",
          status_c: taskData.status_c || taskData.status || "active",
          createdAt_c: taskData.createdAt_c || taskData.createdAt || new Date().toISOString(),
          completedAt_c: taskData.completedAt_c || taskData.completedAt || null
        }]
      }

      const response = await apperClient.createRecord(tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        if (successful.length > 0) {
          toast.success("Task created successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error)
      toast.error("Failed to create task")
      return null
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      // Map UI field names to database field names and filter only Updateable fields
      const updateData = {
        Id: parseInt(id)
      }

      // Map field names and include only non-empty values
      if (updates.title_c !== undefined || updates.title !== undefined) {
        updateData.title_c = updates.title_c || updates.title
      }
      if (updates.description_c !== undefined || updates.description !== undefined) {
        updateData.description_c = updates.description_c || updates.description
      }
      if (updates.priority_c !== undefined || updates.priority !== undefined) {
        updateData.priority_c = updates.priority_c || updates.priority
      }
      if (updates.status_c !== undefined || updates.status !== undefined) {
        updateData.status_c = updates.status_c || updates.status
      }
      if (updates.completedAt_c !== undefined || updates.completedAt !== undefined) {
        updateData.completedAt_c = updates.completedAt_c || updates.completedAt
      }
      if (updates.Tags !== undefined) {
        updateData.Tags = updates.Tags
      }

      // Update Name field to match title_c for consistency
      if (updateData.title_c) {
        updateData.Name = updateData.title_c
      }

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord(tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }

        if (successful.length > 0) {
          toast.success("Task updated successfully")
          return successful[0].data
        }
      }

      return null
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error)
      toast.error("Failed to update task")
      return null
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord(tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }

        if (successful.length > 0) {
          toast.success("Task deleted successfully")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error)
      toast.error("Failed to delete task")
      return false
    }
  }
}