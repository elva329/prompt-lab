<template>
  <div class="project-completed-table-card">
    <table class="project-table">
      <thead>
        <tr>
          <th class="project-table-header left">Category</th>
          <th class="project-table-header right">Percentage (%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="project-table-cell left">
            <span class="dot dot-done"></span>
            Project Done
          </td>
          <td class="project-table-cell right percent">50%</td>
        </tr>
        <tr>
          <td class="project-table-cell left">
            <span class="dot dot-progress"></span>
            In Progress
          </td>
          <td class="project-table-cell right percent">25%</td>
        </tr>
        <tr>
          <td class="project-table-cell left">
            <span class="dot dot-backlog"></span>
            Backlog
          </td>
          <td class="project-table-cell right percent">15%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// No script needed for static table
</script>

<style scoped>
.project-completed-table-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 4px 0 rgba(30, 41, 59, 0.04);
  padding: 0;
  width: 100%;
  max-width: 370px;
  border: 1px solid #f1f5f9;
}
.project-table {
  width: 100%;
  border-collapse: collapse;
}
.project-table-header {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  text-align: left;
  padding: 16px 16px 12px 16px;
  background: none;
  border-bottom: 1px solid #e2e8f0;
}
.project-table-header.right {
  text-align: right;
}
.project-table-cell {
  font-size: 15px;
  color: #1e293b;
  padding: 12px 16px;
  background: none;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.project-table-cell.left {
  display: flex;
  align-items: center;
  font-weight: 500;
}
.project-table-cell.right {
  text-align: right;
}
.project-table-cell.percent {
  font-weight: 600;
  color: #0f172a;
}
.project-table tbody tr:last-child .project-table-cell {
  border-bottom: none;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
  vertical-align: middle;
}
.dot-done {
  background: #4b6bff;
}
.dot-progress {
  background: #ffbfae;
}
.dot-backlog {
  background: #e6edff;
}
</style>
