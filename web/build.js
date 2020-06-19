const shell = require("shelljs");

shell.rm("-rf", "./public");
shell.exec("yarn bundle");
shell.cp("-R", "./assets", "./public/assets");
