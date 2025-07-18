**FREE
///
// FTPIN.RPGLE
// This module contains the implementation of populating FTP scripts in the FTP IN file member.  
// It is used to generate FTP commands for file transfer operations.
// Parameters:
//   USER: User ID for FTP login
//   MDP: Password for FTP login
//   Nom_Objet: Name of the object to be transferred
//   CHEMIN_origine: Source path of the file to be transferred
//   CHEMIN_destination: Destination path on the FTP server
///
ctl-opt nomain;

dcl-f ftpcmd usage(*output) rename(ftpcmd:ftpcmdf) usropn;

dcl-pr writeScriptFtpIn;
  USER Char(10);
  MDP Char(10);
  Nom_Objet char(128);
  CHEMIN_origine Char(256);
  CHEMIN_destination Char(256);
End-Pr;

dcl-proc writeScriptFtpIn export;
  dcl-pi writeScriptFtpIn;
    l_USER Char(10);
    l_MDP Char(10);
    l_Nom_Objet char(128);
    l_chemin_origine Char(256);
    l_CHEMIN_destination Char(256);
  End-Pi;

  dcl-s l_seq packed(6:2) inz(1);

  open ftpcmd;

  srcseq=l_seq;
  srcdat=*zero;
  srcdta = %trimr(l_USER) + ' ' + l_MDP;

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='NAMEFMT 1';

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='bin';

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='cd ' + %trim( l_CHEMIN_destination);

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='lcd ' + %trim( l_chemin_origine);

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='put ' + %trim( l_Nom_Objet) + '.FILE';

  write ftpcmdf;

  l_seq=+1;
  srcseq=l_seq;
  srcdat=*zero;
  srcdta='quit';

  write ftpcmdf;

  close ftpcmd;

  return;
end-proc;
