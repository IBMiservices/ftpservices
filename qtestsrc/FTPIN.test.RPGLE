**free

ctl-opt nomain ccsidcvt(*excp) ccsid(*char : *jobrun);

/include qinclude,TESTCASE
/include 'SOURCES/FTPIN.RPGLE'

dcl-proc test_writeScriptFtpIn export;
  dcl-pi *n extproc(*dclcase) end-pi;

  dcl-s l_USER char(10);
  dcl-s l_MDP char(10);
  dcl-s l_Nom_Objet char(128);
  dcl-s l_chemin_origine char(256);
  dcl-s l_CHEMIN_destination char(256);

  // Input
  l_USER = '';
  l_MDP = '';
  l_Nom_Objet = '';
  l_chemin_origine = '';
  l_CHEMIN_destination = '';

  // Actual results
  actual = writeScriptFtpIn(l_USER : l_MDP : l_Nom_Objet : l_chemin_origine : l_CHEMIN_destination);

  // Expected results

  // Assertions
end-proc;