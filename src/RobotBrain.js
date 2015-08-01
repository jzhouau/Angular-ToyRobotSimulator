/*
Toy Robot Simulator
Author: Jason Zhou

Description:
. The application is a simulation of a toy robot moving on a square tabletop, of dimensions 5 units x 5
  units.
. There are no other obstructions on the table surface.
. The robot is free to roam around the surface of the table, but must be prevented from falling to
  destruction. Any movement that would result in the robot falling from the table must be prevented, 
  however further valid movement commands must still be allowed.
. Create an application that can read in commands of the following form -
  PLACE X,Y,F
  MOVE
  LEFT
  RIGHT
  REPORT
. PLACE will put the toy robot on the table in position X,Y and facing NORTH, SOUTH, EAST or WEST.
. The origin (0,0) can be considered to be the SOUTH WEST most corner.
. The first valid command to the robot is a PLACE command, after that, any sequence of commands
  may be issued, in any order, including another PLACE command. The application should discard all
  commands in the sequence until a valid PLACE command has been executed.
. MOVE will move the toy robot one unit forward in the direction it is currently facing.
. LEFT and RIGHT will rotate the robot 90 degrees in the specified direction without changing the
  position of the robot.
. REPORT will announce the X,Y and F of the robot. This can be in any form, but standard output is
  sufficient.
. A robot that is not on the table can choose the ignore the MOVE, LEFT, RIGHT and REPORT commands.
*/


angular.module('robotSimulator', [])

/* Application constants */
.constant('COMMAND', {
	PLACE: 'PLACE',
	MOVE: 'MOVE',
	LEFT: 'LEFT',
	RIGHT: 'RIGHT',
	REPORT: 'REPORT'
})
.constant('DIRECTION', {
	NORTH: 'NORTH',
	SOUTH: 'SOUTH',
	EAST: 'EAST',
	WEST: 'WEST'
})
.constant('PLACE_CMD_REGEX', /^PLACE\s+([0-4]),([0-4]),(NORTH|SOUTH|EAST|WEST)$/i)
.constant('MAX_POSITION', {	X: 4, Y: 4 })

/* Directive to scroll down to the bottom automatically */
.directive('autoScroll', function() {
	return function(scope, elem, attr) {
		scope.$watch(function() {
			return elem[0].value;
		},
		function(e) {
			elem[0].scrollTop = elem[0].scrollHeight;
		});
	}
})

/* Main robot simulator controller */
.controller('RobotController', function($scope, COMMAND, DIRECTION, PLACE_CMD_REGEX, MAX_POSITION) {
	
	// Robot object with x, y and facing direction
	$scope.robot = null;

	// Flag to indicate a PLACE command has been executed
	var commandInitiated = false;

	// PLACE command
	var PlaceCommand = (function() {
		function PlaceCommand(x, y, facing) {
			this._x = x;
			this._y = y;
			this._facing = facing;
		}
		PlaceCommand.prototype.execute = function() {
			var commandProcessor = new CommandProcessor();
			commandProcessor.place(this._x, this._y, this._facing);
		};
		return PlaceCommand;
	})();

	// MOVE command
	var MoveCommand = (function() {
		function MoveCommand() { }
		MoveCommand.prototype.execute = function() {
			var commandProcessor = new CommandProcessor();
			commandProcessor.move();
		};
		return MoveCommand;
	})();

	// Rotate LEFT/RIGHT command
	var RotateCommand = (function() {
		function RotateCommand(direction) {
			this._direction = direction;
		}

		RotateCommand.prototype.execute = function() {
			var commandProcessor = new CommandProcessor();
			commandProcessor.rotate(this._direction);
		};
		return RotateCommand;
	})();

	// REPORT command
	var ReportCommand = (function() {
		function ReportCommand() { }
		ReportCommand.prototype.execute = function() {
			var commandProcessor = new CommandProcessor();
			commandProcessor.report();
		};
		return ReportCommand;
	})();

	// The command execution is deferred to command processor
	// which implements how command should be executed
	var CommandProcessor = (function() {
		function CommandProcessor() { }

		CommandProcessor.prototype.place = function(x, y, facing) {
			commandInitiated = true;
			$scope.robot = {
				x: parseInt(x),
				y: parseInt(y),
				facing: facing.toUpperCase()
			};
			$scope.output += 'The PLACE command is executed successfully.\n';
		};

		CommandProcessor.prototype.move = function() {
			switch($scope.robot.facing) {
				case DIRECTION.NORTH:
				var newY = $scope.robot.y + 1;
				if (isPositionValid($scope.robot.x, newY)) {
					$scope.robot.y = newY;
					break;
				} else {
					return;
				}				
				case DIRECTION.SOUTH:
				var newY = $scope.robot.y - 1;
				if (isPositionValid($scope.robot.x, newY)) {
					$scope.robot.y = newY;
					break;
				} else {
					return;
				}
				case DIRECTION.EAST:
				var newX = $scope.robot.x + 1;
				if (isPositionValid(newX, $scope.robot.y)) {
					$scope.robot.x = newX;
					break;
				} else {
					return;
				}
				case DIRECTION.WEST:
				var newX = $scope.robot.x - 1;
				if (isPositionValid(newX, $scope.robot.y)) {
					$scope.robot.x = newX;
					break;
				} else {
					return;
				}
				default:
				break;

			}
			$scope.output += 'The MOVE command is executed successfully.\n';
		};

		CommandProcessor.prototype.rotate = function(direction) {
			if (direction === COMMAND.LEFT) {
				switch ($scope.robot.facing) {
					case DIRECTION.NORTH:
					$scope.robot.facing = DIRECTION.WEST;
					break;
					case DIRECTION.SOUTH:
					$scope.robot.facing = DIRECTION.EAST;
					break;
					case DIRECTION.EAST:
					$scope.robot.facing = DIRECTION.NORTH;
					break;
					case DIRECTION.WEST:
					$scope.robot.facing = DIRECTION.SOUTH;
					break;
					default:
					break;
				}
			} else if (direction === COMMAND.RIGHT) {
				switch ($scope.robot.facing) {
					case DIRECTION.NORTH:
					$scope.robot.facing = DIRECTION.EAST;
					break;
					case DIRECTION.SOUTH:
					$scope.robot.facing = DIRECTION.WEST;
					break;
					case DIRECTION.EAST:
					$scope.robot.facing = DIRECTION.SOUTH;
					break;
					case DIRECTION.WEST:
					$scope.robot.facing = DIRECTION.NORTH;
					break;
					default:
					break;
				}
			}
			$scope.output += 'The ' + direction + ' command is executed successfully.\n';
		};

		CommandProcessor.prototype.report = function() {
			$scope.output += 'Output: ' + $scope.robot.x + ', ' + $scope.robot.y + ', ' + $scope.robot.facing + '\n';
		}

		return CommandProcessor;
	})();

	// Check if the new position is out of maximum allowed range
	var isPositionValid = function(x, y) {
		if (x >= 0 && x <= MAX_POSITION.X && y >= 0 && y <= MAX_POSITION.Y) {
			return true;
		} else {
			$scope.output += 'The robot is out of range.\n';
			return false;
		}
	};

	// The command invoker
	var processCommand = function(cmdArray) {
		switch(cmdArray[0].toUpperCase()) {
			case COMMAND.PLACE:
			var placeCmd = cmdArray.join(' ');
			if (PLACE_CMD_REGEX.test(placeCmd)) {
				var matches = PLACE_CMD_REGEX.exec(placeCmd);
				new PlaceCommand(matches[1], matches[2], matches[3]).execute();
			} else {
				$scope.output += 'The PLACE command is invalid, please try again.\n';
			}
			break;

			case COMMAND.MOVE:
			new MoveCommand().execute();
			break;

			case COMMAND.LEFT:
			new RotateCommand(COMMAND.LEFT).execute();
			break;

			case COMMAND.RIGHT:
			new RotateCommand(COMMAND.RIGHT).execute();
			break;

			case COMMAND.REPORT:
			new ReportCommand().execute();
			break;

			default:
			$scope.output += 'The command is invalid, please try again.\n';
			break;
		}
	};

	// Respond to the execute button click
	$scope.executeCommand = function() {
		var command = $scope.command;
		if (command) {

			var cmdArray = command.split(' ');
			if (commandInitiated || cmdArray[0].toUpperCase() == COMMAND.PLACE) {
				processCommand(cmdArray);

			} else {
				$scope.output += 'The initial command must be PLACE command.\n';
			}
			
		} else {
			$scope.output += 'The command is empty, please try again.\n';
		}
	};

	// Respond to clear output button click
	$scope.clearOutput = function() {
		$scope.output = '';
	};
});