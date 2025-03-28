# Create directory structure
mkdir -Force -Path src/pages/admin/students/studentsManagment, src/pages/admin/students/student, src/pages/admin/students/studentCourses, src/pages/admin/students/studentCourse

# List of component names
$components = @("studentsManagment", "student", "studentCourses", "studentCourse")

foreach ($component in $components) {
    # Create JS file with React template
    $jsContent = @"
import React from 'react';
import './$component.css';

const $component = () => {
  return (
    <div className="$component-container">
      <h1>$component Component</h1>
    </div>
  );
};

export default $component;
"@
    $jsContent | Out-File -FilePath "src/pages/admin/students/$component/$component.js" -Encoding utf8 -Force

    # Create CSS file
    $cssContent = @"
.$component-container {
  /* Add your styles here */
}
"@
    $cssContent | Out-File -FilePath "src/pages/admin/students/$component/$component.css" -Encoding utf8 -Force
}