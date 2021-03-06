'use strict';

Paletto.Color = { JOUEUR_1: 0, JOUEUR_2: 1 };
Paletto.PieceColor = {black : 0, white : 1, red : 2, green : 3, blue : 4, yellow : 5};
Paletto.Phase = { FIRST_TAKE: 0, CONTINUE_TAKING: 1};
Paletto.Board = [[0,4,3,0,3,1],[2,3,4,5,1,2],[3,2,3,2,0,1],[0,1,5,4,1,3],[4,5,1,2,5,4],[5,2,5,0,4,0]];

Paletto.Move = function (c,fx,fy,p,b) {

    // private attributes
    var _color; // player
    var _from_x; // where player take piece
    var _from_y;
    var _piece_color; // color player take
    var _button_next; // true if player cliked next

    // private methods
    // init method is called when an instance is created
    var init = function (color, from_x, from_y, piece_color, button_next) {
        _color = color;
        _from_x = from_x;
        _from_y = from_y;
        _piece_color = piece_color;
        _button_next = button_next;
    };


    // public methods
    // methods to access of private attributes
    this.get_string_color_name = function(color){
        switch(parseInt(color)) {
            case 0:
                return 'black';
            case 1:
                return 'white';
            case 2:
                return 'red';
            case 3:
                return 'green';
            case 4:
                return 'blue';
            case 5:
                return 'yellow';
            default:
                return 'error';
        }
    };

    this.color = function (){
        return _color;
    };

    this.from_x = function(){
        return _from_x;
    };

    this.from_y = function(){
        return _from_y;
    };

    this.piece_color = function(){
        return _piece_color;
    };

    this.button_next = function(){
        return _button_next;
    };


    // methods to build (or parse) the textual representation of a move
    this.get = function () {
        var bool_button = 0;
        if(_button_next == true) bool_button = 1;
        return (_color === Paletto.Color.JOUEUR_1 ? '1' : '2') + _piece_color + '' + _from_x + '' + _from_y + '' + bool_button;
    };

    this.parse = function (str) {
        _color = str.charAt(0) === '1' ? Paletto.Color.JOUEUR_1 : Paletto.Color.JOUEUR_2;
        _piece_color = str.charAt(1);
        _from_x = str.charAt(2);
        _from_y = str.charAt(3);
        _button_next = (str.charAt(4)==1);
    };

    // build an object representation with all public attributes
    this.to_object = function () {
        return { color: _color, from_x: _from_x, from_y : _from_y , piece_color: _piece_color, button_next: _button_next};
    };

    // build a string with a sentence describe the move
    this.to_string = function () {
        var color = _color+1;
        if(_button_next == true) return 'Player ' + color + 'cliked on NEXT button';
        return 'Player ' + color + ' take color ' + this.get_string_color_name(_piece_color) + ' from (' + _from_x + ',' + _from_y + ')';
    };

    // call init method
    init(c,fx,fy,p,b);
};




Paletto.Engine = function (t, c, gt, bs) {

//***************
// private attributes
// the variable phase indicated the phase of game : PUT_PIECE, REMOVE_ROW, by example
// this variable is used by manager
    var _phase;

// all attributes of game
    var type;
    var color;

    var game_type;
    var game_board;
    var player_1_pieces;
    var player_2_pieces;

    var self = this;

    var taken_color = null;

//private method
    var initialize_board_piece = function(){
        var tmp_piece_color_array = new Array(6);
        for(var x = 0; x < 6; x++) {
            tmp_piece_color_array[x] = 0;
        }
        var cpt_iter;
        for(x = 0; x < 6; x++){
            for(var y = 0; y < 6 ; y++){
                cpt_iter = 0;
                var tmp_piece_color;
                // while color generated can't place here
                do{
                    // if cpt_iter > 30 => can't finish board! bcs last piece have same color neighbour
                    if(cpt_iter > 30){
                        return false;
                    }
                    else{
                        tmp_piece_color = Math.floor(Math.random() * 6);
                        cpt_iter++;
                    }

                } while(!is_possible_to_put_piece_color(x,y,tmp_piece_color,tmp_piece_color_array[tmp_piece_color]));
                tmp_piece_color_array[tmp_piece_color]++;
                game_board[x][y] = tmp_piece_color;
            }
        }
        return true;
    };

    var init_board_array = function(){
        player_1_pieces = new Array(6);
        player_2_pieces = new Array(6);
        for(var i = 0; i < 6; i++){
            player_1_pieces[i]=0;
            player_2_pieces[i]=0;
        }
        game_board = new Array(6);
        for(var x = 0; x < 6; x++) {
            game_board[x] = new Array(6);
        }
        for(x = 0; x < 6; x++) {
            for (var y = 0; y < 6; y++) {
                game_board[x][y]=-1;
            }
        }
    };


    // check if piece have neighbour
    var check_piece_top = function (x,y){
        return (y != 0);
    };
    var check_piece_left = function (x,y){
        return (x != 0);
    };
    var check_piece_right = function (x,y){
        return (x != 5);
    };
    var check_piece_bottom = function (x,y){
        return (y != 5);
    };

    // bool for know if this color is ok for this place
    var is_possible_to_put_piece_color = function(x,y,piece_color,nb_piece_color){
        if(nb_piece_color >=6) return false;

        if(check_piece_top(x,y)){
            if(game_board[x][y-1] == piece_color){
                return false;
            }
        }
        if(check_piece_left(x,y)){
            if(game_board[x-1][y] == piece_color){
                return false;
            }
        }
        if(check_piece_right(x,y)){
            if(game_board[x+1][y] == piece_color){
                return false;
            }
        }
        if(check_piece_bottom(x,y)){
            if(game_board[x][y+1] == piece_color){
                return false;
            }
        }
        return true;
    };

    var next_color = function (color) {
        return color === Paletto.Color.JOUEUR_2 ? Paletto.Color.JOUEUR_1 : Paletto.Color.JOUEUR_2;
    };


//***************
// public methods
// play a move (the move is an instance of XXX.Move class)
    this.next_player = function(){
        color = next_color(color);
        _phase = Paletto.Phase.FIRST_TAKE;
        taken_color = null;
    };

    this.board_to_string = function(){
        var str = '';
        for(var x = 0; x < 6; x++){
            for(var y = 0; y < 6 ; y++) {
                str += game_board[x][y];
            }
        }
        return str;
    };

    this.board_parse = function(str){
        var cpt = 0;
        //game_board = new Array(6);
        for(var x = 0; x < 6; x++) {
            //game_board[x] = new Array(6);
            for (var y = 0; y < 6; y++) {
                game_board[x][y] = parseInt(str.charAt(cpt));
                cpt++;
            }

        }
    };

    this.move = function (move) {
        if(typeof move == 'object' ){
            if(move.button_next()) this.next_player();
            else {
                this.put_piece_to_player(move.from_x(),move.from_y(),move.piece_color(),move.color());
                taken_color = move.piece_color();
            }
        }

    };

    this.put_piece_to_player = function(from_x,from_y,piece_color,color){
        game_board[from_x][from_y]= -1;
        if(color === Paletto.Color.JOUEUR_1){
            player_1_pieces[piece_color]++;
        }
        else{
            player_2_pieces[piece_color]++;
        }
        _phase = Paletto.Phase.CONTINUE_TAKING;
    };

    // return color at xy
    this.get_piece_color_from_x_y = function(x,y){
        return game_board[x][y];
    };

    // return how many player have take one color
    this.get_taken_color = function (player,color){
        if(player == Paletto.Color.JOUEUR_1) return player_1_pieces[color];
        else return player_2_pieces[color];
    };

// get the color of current player
    this.current_color = function () {
        return color;
    };

// get the phase of game
    this.phase = function() {
        return _phase;
    };

    this.game_type = function(){
        return game_type;
    };

// verify if game is finished
    this.is_finished = function () {
        // if last piece
        var cpt = 0;
        for(var x = 0; x < 6; x++){
            for(var y = 0; y < 6 ; y++){
                if(game_board[x][y]!=-1) cpt++;
            }
        }
        if(cpt == 0) return true;

        // if one player have the set of color
        for(var i = 0; i < 6; i++){
            if(player_1_pieces[i]==6) return true;
            if(player_2_pieces[i]==6) return true;
        }

    };

// return the color of winner if game is finished
    this.winner_is = function () {
        if(this.is_finished()){
            return color;
        }
    };

    // true if piece can be taken
    this.possible_taken_piece = function(x,y){
        var pt= false, pl = false, pr = false, pb = false;
        if (game_board[x][y]==-1) return false;
        if (taken_color != null && game_board[x][y] != taken_color) return false;
        var cpt = 4;
        if(check_piece_top(x,y)){
            if(game_board[x][y-1] != -1){
                cpt--;
                pt = true;
            }
        }
        if(check_piece_left(x,y)){
            if(game_board[x-1][y] != -1){
                cpt--;
                pl = true;
            }
        }
        if(check_piece_right(x,y)){
            if(game_board[x+1][y] != -1){
                cpt--;
                pr = true;
            }
        }
        if(check_piece_bottom(x,y)){
            if(game_board[x][y+1] != -1){
                cpt--;
                pb = true;
            }
        }

        // si 2 alors vérifier si l'opposé diagonal est non-vide
        if(cpt == 2){
            return this.check_is_split(x,y,pt,pl,pr,pb);
        }

        return (cpt >=2);
    };

    this.check_is_split = function(x,y,pt,pl,pr,pb){
        // top & left
        if(pt && pl && game_board[x-1][y-1] == -1) return false;
        // top & right
        if(pt && pr && game_board[x+1][y-1] == -1) return false;
        // bottom & left
        if(pb && pl && game_board[x-1][y+1] == -1) return false;
        // bottom & right
        if(pb && pr && game_board[x+1][y+1] == -1) return false;
        // top & bottom
        if(pt && pb && !pl && !pr) return false;
        // left & right
        if(pl && pr && !pt && !pb) return false;

        //
        return true;
    };

    // return possible list
    this.get_possible_taken_list = function() {
        var list = [];
        for(var x = 0; x < 6; x++){
            for(var y = 0; y < 6 ; y++){
                if(this.possible_taken_piece(x,y)){
                    list.push({x: x, y: y });
                }
            }
        }
        return list;
    };

//***************
// two methods to clone an engine
// mainly method: create a new object and set all attributes (values are passed as parameters)
    this.clone = function () {
        var o = new Paletto.Engine(type, color);

        o.set(_phase,game_board,player_1_pieces,player_2_pieces);
        return o;
    };

    this.current_color = function () {
        return color;
    };

    this.current_color_string = function () {
        return color === Paletto.Color.JOUEUR_1 ? 'Player 1' : 'Player 2';
    };

// set all attributes using parameter values
// warning to attributes of object or array type
    this.set = function (p,gb,p1p,p2p) {
        _phase = p;

        // clone game_board
        for(var x = 0; x < 6; x++){
            for(var y = 0; y < 6 ; y++){
                game_board[x][y]=gb[x][y];
            }
        }

        // clone player pieces
        for(var i = 0; i < 6; i++){
            player_1_pieces[i]=p1p[i];
            player_2_pieces[i]=p2p[i];
        }

    };

//***************
// methods for MCTS Artificial Intelligence
// return the list of possible moves
//    this.get_possible_move_list = function () {
//        return this.get_possible_taken_list();
//    };
//
//// get the number of possible moves in current list
//    this.get_possible_move_number = function(list) {
//        return this.get_possible_taken_list().length;
//    };
//
//// remove first move in possible move list
//    this.remove_first_possible_move = function(list) {
//        var L = list;
//
//        L.list.shift();
//        return L;
//    };
//
//// select a move in list with specified index
//    this.select_move = function (list, index) {
//        return new Paletto.Move(list, list.list[index]);
//    };

//***************
// init method is called when an instance is created
    var init = function(t, c, gt, bs) {

        console.log("called paletto/Engine init");
        type  = t;
        color = c;
        game_type = gt;
        _phase=Paletto.Phase.FIRST_TAKE;
        init_board_array();
        if( bs == null){
            do{
                // redo initialisation while he can't get full board
            }while(!initialize_board_piece());
        }
        else{
            self.board_parse(bs);
        }

    };

// call init method with two parameters: t, the type of game and c, the color of first player
    init(t, c ,gt ,bs);
};