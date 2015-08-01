/*
Unit test for RobotBrain.js
Author: Jason Zhou
*/

describe('RobotController', function() {
	beforeEach(module('robotSimulator'));

	var $scope;

	beforeEach(inject(function(_$controller_){
		$scope = {};
		_$controller_('RobotController', { $scope: $scope });
	}));

	var runCommand = function(commands) {
		angular.forEach(commands, function(command) {
			$scope.command = command;
			$scope.executeCommand();
		});
	};

	describe('Execute command test', function() {		
		it('Execute a empty command', function() {
			runCommand(['']);
			expect($scope.robot).toBeNull();
		});

		it('Execute a invalid command', function() {
			runCommand(['INVALID']);
			expect($scope.robot).toBeNull();
		});

		it('Execute a non-PLACE command as first command', function() {
			runCommand(['MOVE']);
			expect($scope.robot).toBeNull();
		});

		it('Execute a valid PLACE command', function() {
			runCommand(['PLACE 0,0,NORTH']);
			expect($scope.robot).toEqual({ x: 0, y: 0, facing: 'NORTH' });
		});

		it('Execute valid [PLACE, PLACE] command', function() {
			runCommand(['PLACE 0,0,NORTH', 'PLACE 2,3,WEST']);
			expect($scope.robot).toEqual({ x: 2, y: 3, facing: 'WEST' });
		});

		it('Execute valid [PLACE, MOVE] command', function() {
			runCommand(['PLACE 0,0,NORTH', 'MOVE']);
			expect($scope.robot).toEqual({ x: 0, y: 1, facing: 'NORTH' });
		});

		it('Execute [PLACE, LEFT] command', function() {
			runCommand(['PLACE 0,0,NORTH', 'LEFT']);
			expect($scope.robot).toEqual({ x: 0, y: 0, facing: 'WEST' });
		});

		it('Execute [PLACE, RIGHT] command', function() {
			runCommand(['PLACE 0,0,NORTH', 'RIGHT']);
			expect($scope.robot).toEqual({ x: 0, y: 0, facing: 'EAST' });
		});

		it('Execute [PLACE, REPORT] command', function() {
			runCommand(['PLACE 0,0,NORTH', 'REPORT']);
			expect($scope.robot).toEqual({ x: 0, y: 0, facing: 'NORTH' });
			expect($scope.output.slice(-20)).toEqual('Output: 0, 0, NORTH\n');
		});

		it('Execute [PLACE, LEFT, MOVE, RIGHT, MOVE, MOVE] command', function() {
			runCommand(['PLACE 0,0,EAST', 'LEFT', 'MOVE', 'RIGHT', 'MOVE', 'MOVE']);
			expect($scope.robot).toEqual({ x: 2, y: 1, facing: 'EAST' });
		});

		it('Execute a PLACE command that will fall off the table', function() {
			runCommand(['PLACE 5,0,NORTH']);
			expect($scope.robot).toBeNull();
		});

		it('Execute [PLACE, MOVE] command that will fall off the table', function() {
			runCommand(['PLACE 0,4,NORTH', 'MOVE']);
			expect($scope.robot).toEqual({ x: 0, y: 4, facing: 'NORTH' });
		});
	});

	describe('Clear output test', function() {
		it('clears the output textarea', function() {
			$scope.clearOutput();
			expect($scope.output).toEqual('');
		});
	});
});