<!-- src/lib/LoggerPanel.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { logger } from './logger';
    
    export let isOpen = false;
    
    let logs = [];
    let refreshInterval;
    let autoRefresh = true;
    let filterText = '';
    let logLevelFilter = 'all';
    
    onMount(() => {
      refreshLogs();
      // Set up auto-refresh
      refreshInterval = setInterval(() => {
        if (autoRefresh && isOpen) {
          refreshLogs();
        }
      }, 2000);
    });
    
    onDestroy(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });
    
    function refreshLogs() {
      logs = logger.getLogs();
    }
    
    function downloadLogsAsJson() {
      logger.downloadLogs(`layout-logs-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`);
    }
    
    function downloadLogsAsText() {
      logger.downloadLogsAsText(`layout-logs-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.txt`);
    }
    
    function clearLogs() {
      logger.clearLogs();
      refreshLogs();
    }
    
    $: filteredLogs = logs.filter(log => {
      const matchesText = filterText === '' || 
                         log.message.toLowerCase().includes(filterText.toLowerCase());
      const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
      return matchesText && matchesLevel;
    });
    
    function getLogLevelClass(level) {
      switch(level) {
        case 'error': return 'error-log';
        case 'warn': return 'warn-log';
        case 'info': return 'info-log';
        case 'time': return 'time-log';
        case 'timeEnd': return 'time-end-log';
        default: return 'debug-log';
      }
    }
    
    function togglePanel() {
      isOpen = !isOpen;
      if (isOpen) {
        refreshLogs();
      }
    }
  </script>
  
  {#if isOpen}
  <div class="logger-panel">
    <div class="logger-controls">
      <button on:click={togglePanel}>Close</button>
      <button on:click={refreshLogs}>Refresh</button>
      <button on:click={downloadLogsAsJson}>Download JSON</button>
      <button on:click={downloadLogsAsText}>Download Text</button>
      <button on:click={clearLogs}>Clear Logs</button>
      
      <label>
        <input type="checkbox" bind:checked={autoRefresh} />
        Auto-refresh
      </label>
      
      <div class="filter-controls">
        <input type="text" placeholder="Filter logs..." bind:value={filterText} />
        
        <select bind:value={logLevelFilter}>
          <option value="all">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
          <option value="time">Time</option>
          <option value="timeEnd">TimeEnd</option>
        </select>
      </div>
    </div>
    
    <div class="logs-container">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredLogs as log}
          <tr class={getLogLevelClass(log.level)}>
            <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
            <td>{log.level.toUpperCase()}</td>
            <td>
              {log.message}
              {#if log.data}
              <pre>{JSON.stringify(log.data, null, 2)}</pre>
              {/if}
            </td>
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  {:else}
  <div class="logger-toggle">
    <button on:click={togglePanel}>Show Logs</button>
  </div>
  {/if}
  
  <style>
    .logger-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background-color: #f5f5f5;
      border-top: 1px solid #ccc;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: monospace;
    }
    
    .logger-controls {
      padding: 8px;
      border-bottom: 1px solid #ccc;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .filter-controls {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }
    
    .logs-container {
      flex-grow: 1;
      overflow-y: auto;
      padding: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      text-align: left;
      padding: 4px 8px;
      border-bottom: 1px solid #eee;
    }
    
    th {
      position: sticky;
      top: 0;
      background: #f5f5f5;
      z-index: 1;
    }
    
    pre {
      margin: 4px 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .error-log { color: #d32f2f; }
    .warn-log { color: #f57c00; }
    .info-log { color: #0288d1; }
    .debug-log { color: #555; }
    .time-log { color: #2e7d32; }
    .time-end-log { color: #2e7d32; font-weight: bold; }
    
    .logger-toggle {
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 1000;
    }
    
    button {
      padding: 4px 8px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #f0f0f0;
    }
    
    input[type="text"], select {
      padding: 4px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  </style>